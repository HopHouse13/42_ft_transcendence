import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { GameRoomService, PlayerRoom } from './game-room.service';
import { OthelloService } from '../othello/othello.service';

/* -------------------------------------------------------------------------- */
/*                              ~~ Helpers ~~                                 */
/* -------------------------------------------------------------------------- */

const makePlayer = (overrides: Partial<PlayerRoom> = {}): PlayerRoom => ({
    userId: 'user-1',
    socketId: 'socket-1',
    ...overrides,
});

/* -------------------------------------------------------------------------- */
/*                       ~~ Test Suite: GameRoomService ~~                    */
/* -------------------------------------------------------------------------- */

describe('GameRoomService', () => {
    let service: GameRoomService;
    let othelloService: { createGame: jest.Mock };

    beforeEach(async () => {

        othelloService = {
            createGame: jest.fn().mockReturnValue({ id: 'game-1' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameRoomService,
                { provide: OthelloService, useValue: othelloService },
            ],
        }).compile();

        service = module.get<GameRoomService>(GameRoomService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait être défini', () => {
        expect(service).toBeDefined();
    });

    /* ---------------------------------------------------------------------- */
    /*                          newPlayerEntry()                              */
    /* ---------------------------------------------------------------------- */

    describe('newPlayerEntry', () => {

        it('crée une nouvelle room et retourne son roomId quand aucune room en attente', () => {

            const player = makePlayer({ userId: 'user-1' });

            const result = service.newPlayerEntry(player);

            expect(typeof result).toBe('string');
            expect(othelloService.createGame).not.toHaveBeenCalled();
        });

        it('rejoint une room en attente existante et lance la partie', () => {

            const player1 = makePlayer({ userId: 'user-1' });
            const player2 = makePlayer({ userId: 'user-2' });

            const roomId = service.newPlayerEntry(player1) as string;
            const result = service.newPlayerEntry(player2);

            expect(othelloService.createGame).toHaveBeenCalledTimes(1);
            expect(othelloService.createGame).toHaveBeenCalledWith('user-1', 'user-2');
            expect(result).toEqual({ id: 'game-1' });
            expect(roomId).toEqual(expect.any(String));
        });

        it('supprime la room une fois que la partie est lancée', () => {

            const player1 = makePlayer({ userId: 'user-1' });
            const player2 = makePlayer({ userId: 'user-2' });

            const roomId = service.newPlayerEntry(player1) as string;
            service.newPlayerEntry(player2);

            // La room a été supprimée : un 3e joueur ne doit pas pouvoir la rejoindre
            expect(() => (service as any)._readRoom(roomId)).toThrow(NotFoundException);
        });

        it('ne fait pas rejoindre un joueur à sa propre room (garde-fou)', () => {

            const player1 = makePlayer({ userId: 'user-1' });
            const samePlayerAgain = makePlayer({ userId: 'user-1', socketId: 'socket-2' });

            service.newPlayerEntry(player1);
            const result = service.newPlayerEntry(samePlayerAgain);

            // Comme il ne peut pas rejoindre sa propre room, une nouvelle room est créée
            expect(typeof result).toBe('string');
            expect(othelloService.createGame).not.toHaveBeenCalled();
        });

        it('associe un joueur avec couleur opposée en priorité', () => {

            const player1 = makePlayer({ userId: 'user-1', color: 'black' });
            const player2 = makePlayer({ userId: 'user-2', color: 'white' });

            service.newPlayerEntry(player1);
            const result = service.newPlayerEntry(player2);

            expect(othelloService.createGame).toHaveBeenCalledWith('user-1', 'user-2');
            expect(result).toEqual({ id: 'game-1' });
        });

        it('crée une nouvelle room si la couleur demandée est déjà prise', () => {

            const player1 = makePlayer({ userId: 'user-1', color: 'black' });
            const player2 = makePlayer({ userId: 'user-2', color: 'black' });

            service.newPlayerEntry(player1);
            const result = service.newPlayerEntry(player2);

            expect(typeof result).toBe('string');
            expect(othelloService.createGame).not.toHaveBeenCalled();
        });
    });

    /* ---------------------------------------------------------------------- */
    /*                         invitPlayerEnty()                              */
    /* ---------------------------------------------------------------------- */

    describe('invitPlayerEnty', () => {

        it('crée une room et retourne son roomId quand player.invit est vide', () => {

            const player = makePlayer({ userId: 'user-1' });

            const result = service.invitPlayerEnty(player);

            expect(typeof result).toBe('string');
            expect(othelloService.createGame).not.toHaveBeenCalled();
        });

        it('rejoint la room via invit et lance la partie', () => {

            const player1 = makePlayer({ userId: 'user-1' });
            const roomId = service.invitPlayerEnty(player1) as string;

            const player2 = makePlayer({ userId: 'user-2', invit: roomId });
            const result = service.invitPlayerEnty(player2);

            expect(othelloService.createGame).toHaveBeenCalledTimes(1);
            expect(othelloService.createGame).toHaveBeenCalledWith('user-1', 'user-2');
            expect(result).toEqual({ id: 'game-1' });
        });

        it('supprime la room une fois la partie lancée via invitation', () => {

            const player1 = makePlayer({ userId: 'user-1' });
            const roomId = service.invitPlayerEnty(player1) as string;

            const player2 = makePlayer({ userId: 'user-2', invit: roomId });
            service.invitPlayerEnty(player2);

            expect(() => (service as any)._readRoom(roomId)).toThrow(NotFoundException);
        });

        it('lève une NotFoundException si le roomId (invit) est inconnu', () => {

            const player = makePlayer({ userId: 'user-2', invit: 'unknown-room-id' });

            expect(() => service.invitPlayerEnty(player)).toThrow(NotFoundException);
            expect(othelloService.createGame).not.toHaveBeenCalled();
        });
    });
});
