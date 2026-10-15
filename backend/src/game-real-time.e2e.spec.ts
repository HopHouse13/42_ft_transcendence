import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

import { GameRoomGateway } from './game-room/game-room.gateway';
import { GameRoomService } from './game-room/game-room.service';
import { OthelloService } from './othello/othello.service';
import { PrismaService } from './prisma/prisma.service';

/* -------------------------------------------------------------------------- */
/*                                                                            */
/*  Test e2e : preuve que les DEUX joueurs sont notifiés en temps réel,       */
/*  et que la partie se joue en direct (coup joué par A vu par B et vice-versa*/
/*                                                                            */
/*  Chemins d'import à adapter selon votre arborescence réelle.               */
/*                                                                            */
/* -------------------------------------------------------------------------- */

describe('Temps réel : matchmaking + coups joués via WebSocket (e2e)', () => {

    let app: INestApplication;
    let baseUrl: string;

    const prismaMock = {
        game: { create: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
        move: { deleteMany: jest.fn() },
    };

    beforeAll(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameRoomGateway,
                GameRoomService,
                OthelloService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.listen(0);

        const address = app.getHttpServer().address();
        baseUrl = `http://localhost:${address.port}`;
    });

    afterAll(async () => {
        await app.close();
    });

    /* -------------------------------------------------------------------------- */
    /*  Helper : connecte un client avec un userId donné et attend 'connect'      */
    /* -------------------------------------------------------------------------- */

    const connectClient = (userId: string): Promise<Socket> => {

        return new Promise((resolve, reject) => {

            const socket = io(baseUrl, { query: { userId }, transports: ['websocket'] });

            socket.once('connect', () => resolve(socket));
            socket.once('connect_error', reject);
        });
    };

    /* -------------------------------------------------------------------------- */
    /*  Helper : attend un événement précis, avec timeout explicite               */
    /* -------------------------------------------------------------------------- */

    const waitFor = <T = any>(socket: Socket, event: string, timeoutMs = 3000): Promise<T> => {

        return new Promise((resolve, reject) => {

            const timer = setTimeout(
                () => reject(new Error(`Timeout en attente de l'événement "${event}"`)),
                timeoutMs,
            );

            socket.once(event, (payload: T) => {
                clearTimeout(timer);
                resolve(payload);
            });
        });
    };

    it('les deux joueurs sont notifiés du match trouvé (pas seulement celui qui déclenche le match)', async () => {

        const clientA = await connectClient('user-1');
        const clientB = await connectClient('user-2');

        // A se met en attente
        clientA.emit('findMatch', { userId: 'user-1' });
        const waiting = await waitFor<{ roomId: string }>(clientA, 'waiting');
        expect(typeof waiting.roomId).toBe('string');

        // B arrive : les DEUX doivent recevoir 'matchFound', pas juste B
        const matchFoundA = waitFor(clientA, 'matchFound');
        const matchFoundB = waitFor(clientB, 'matchFound');

        clientB.emit('findMatch', { userId: 'user-2' });

        const [gameStateA, gameStateB] = await Promise.all([matchFoundA, matchFoundB]);

        expect((gameStateA as any).gameId).toEqual((gameStateB as any).gameId);
        expect((gameStateA as any).players.map((p: any) => p.userId).sort()).toEqual(['user-1', 'user-2']);

        clientA.disconnect();
        clientB.disconnect();
    });

    it('un coup joué par un joueur est vu EN DIRECT par les deux clients', async () => {

        const clientA = await connectClient('user-3');
        const clientB = await connectClient('user-4');

        clientA.emit('findMatch', { userId: 'user-3' });
        await waitFor(clientA, 'waiting');

        const matchFoundA = waitFor<any>(clientA, 'matchFound');
        const matchFoundB = waitFor<any>(clientB, 'matchFound');
        clientB.emit('findMatch', { userId: 'user-4' });
        const [gameStateA] = await Promise.all([matchFoundA, matchFoundB]);

        // On utilise un coup légal réellement calculé par le moteur (pas de coordonnées en dur)
        const firstLegalMove = gameStateA.validMoves[0];
        const blackPlayer = gameStateA.players.find((p: any) => p.color === 'BLACK');

        const moveAppliedA = waitFor<any>(clientA, 'moveApplied');
        const moveAppliedB = waitFor<any>(clientB, 'moveApplied');

        clientA.emit('playMove', {
            gameId: gameStateA.gameId,
            userId: blackPlayer.userId,
            move: firstLegalMove,
        });

        const [resultA, resultB] = await Promise.all([moveAppliedA, moveAppliedB]);

        // Les deux clients reçoivent le MÊME état de plateau mis à jour
        expect(resultA.board).toEqual(resultB.board);
        expect(resultA.userId).toEqual(blackPlayer.userId);

        clientA.disconnect();
        clientB.disconnect();
    });
});

/* -------------------------------------------------------------------------- */
