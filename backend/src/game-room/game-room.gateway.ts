/* ========================================================================== */
/*                                                                            */
/*  Gateway temps réel : matchmaking + coups joués en direct.                 */
/*                                                                            */
/*  Chemins d'import à adapter selon l'emplacement réel de ce fichier         */
/*  dans votre arborescence (ex: src/game-room/game.gateway.ts).              */
/*                                                                            */
/* ========================================================================== */

import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { GameRoomService } from '../game-room/game-room.service';
import type { PlayerRoom } from '../game-room/interfaces/player-room.interface';
import { OthelloService } from '../othello/othello.service';
import type { GameState } from '../othello/interfaces/game-state.interface';
import type { MoveResult } from '../othello/interfaces/move-result.interface';
import type { Move } from '../othello/types/move.type';

/* -------------------------------------------------------------------------- */
/*  CORS: à restreindre à l'origine réelle du front en prod (pas '*').        */
/* -------------------------------------------------------------------------- */

@WebSocketGateway( { cors: { origin: '*' }} )
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;
    
    /* -------------------------------------------------------------------------- */
    /* userId -> socketId courant. Permet de notifier N'IMPORTE QUEL joueur,      */
    /* même celui qui attend depuis longtemps (pas seulement l'appelant).         */
    /*                                                                            */
    /* userId -> gameId, pour retrouver la partie en cours au disconnect.         */
    /* -------------------------------------------------------------------------- */

    private readonly connectedUsers = new Map<string, string>();
    private readonly activeGameByUser = new Map<string, string>();

    constructor( private readonly gameRoomService: GameRoomService, private readonly othelloService: OthelloService ) {}

    /* -------------------------------------------------------------------------- */
    /*  Connexion : le client DOIT fournir son userId en query de handshake,      */
    /*  ex (front): io(URL, { query: { userId } })                                */
    /* -------------------------------------------------------------------------- */

    handleConnection(client: Socket) {

        const userId = client.handshake.query.userId as string | undefined;
        if (!userId)    {

            client.disconnect(true); return;
        }
        
        this.connectedUsers.set(userId, client.id);
    }

    /* -------------------------------------------------------------------------- */

    handleDisconnect(client: Socket) {

        for ( const [userId, socketId] of this.connectedUsers.entries() )   {

            if (socketId !== client.id) continue;

            this.connectedUsers.delete(userId);

            const gameId = this.activeGameByUser.get(userId);
            if (gameId) {

                this.othelloService.markDisconnected(gameId, userId);
                this.server.to(`game:${gameId}`).emit('opponentDisconnected', { userId } );
            }
            break;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Matchmaking par couleur (équivalent WS de POST /game-room/entry)          */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('findMatch')
    async onFindMatch( @ConnectedSocket() client: Socket, @MessageBody() body: { userId: string; color?: string } ) {

        const player: PlayerRoom = { userId: body.userId, socketId: client.id, color: body.color };
        const result = await this.gameRoomService.newPlayerEntry(player);

        if (typeof result === 'string') {

            client.emit('waiting', { roomId: result });
            return;
        }

        this._onMatchFound(result);
    }

    @SubscribeMessage('createBotGame')
    onCreateBotGame( @ConnectedSocket() client: Socket, @MessageBody() body: { userId: string } ) {

        if (this.connectedUsers.get(body.userId) !== client.id) {
            client.emit('gameError', { message: 'Utilisateur non authentifié pour cette connexion' });
            return;
        }

        const gameState = this.othelloService.createLocalGame(body.userId);
        const room = `game:${gameState.gameId}`;
        client.join(room);
        this.activeGameByUser.set(body.userId, gameState.gameId);
        client.emit('matchFound', gameState);
    }

    /* -------------------------------------------------------------------------- */
    /*  Invitation (équivalent WS de POST /game-room/invit)                       */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('createInvite')
    async onCreateInvite( @ConnectedSocket() client: Socket, @MessageBody() body: { userId: string } ) {

        const player: PlayerRoom = { userId: body.userId, socketId: client.id };
        const roomId = await this.gameRoomService.invitPlayerEntry(player);

        client.emit('inviteCreated', { roomId });
    }

    @SubscribeMessage('joinInvite')
    async onJoinInvite( @ConnectedSocket() client: Socket, @MessageBody() body: { userId: string; invit: string } ) {

        const player: PlayerRoom = { userId: body.userId, socketId: client.id, invit: body.invit };
        const result = await this.gameRoomService.invitPlayerEntry(player);

        this._onMatchFound(result as GameState);
    }

    /* -------------------------------------------------------------------------- */
    /*  Notifie LES DEUX joueurs et les fait rejoindre la room de la partie       */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */

    private _onMatchFound(gameState: GameState) {

        for (const p of gameState.players) {

            this.activeGameByUser.set(p.userId, gameState.gameId);

            const socketId = this.connectedUsers.get(p.userId);
            const socket = socketId ? this.server.sockets.sockets.get(socketId) : undefined;

            socket?.join(`game:${gameState.gameId}`);
            socket?.emit('matchFound', gameState);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Coup joué en temps réel : broadcast à toute la room (les 2 joueurs)       */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('playMove')
    async onPlayMove( @MessageBody() body: { gameId: string; userId: string; move: Move } ) {

        let result: MoveResult;
        try {
            result = this.othelloService.playMove(body.gameId, body.userId, body.move);

        } catch (err) {

            const socketId = this.connectedUsers.get(body.userId);
            const socket = socketId ? this.server.sockets.sockets.get(socketId) : undefined;
            socket?.emit('moveRejected', {
                message: err instanceof Error ? err.message : 'Coup invalide',
            });
            return;
        }

        const room = this.server.to(`game:${body.gameId}`);
        room.emit('moveApplied', { userId: body.userId, ...result });

        if (this.othelloService.isBotTurn(body.gameId)) {
            room.emit('botThinking');
            try {
                const gameState = await this.othelloService.playBotTurn(body.gameId);
                if (gameState) {
                    this.server.to(`game:${body.gameId}`).emit('gameState', gameState);
                }
            } catch (err) {
                this.server.to(`game:${body.gameId}`).emit('botError', {
                    message: err instanceof Error ? err.message : 'Le bot n’a pas pu jouer',
                });
            }
        }
    }
    
}

/* -------------------------------------------------------------------------- */
