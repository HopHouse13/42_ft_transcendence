/* eslint-disable */


/* ========================================================================== */
/*  OthelloGateway : aligné sur les events du front (useGameSocket.ts)        */
/*                                                                            */
/*  Le front EMET : findMatch | createBotGame | playMove                      */
/*  Le front ECOUTE : waiting | matchFound | moveApplied | moveRejected |     */
/*                    gameState | gameError | botThinking | botError          */
/* ========================================================================== */

import {
    WebSocketGateway, WebSocketServer, SubscribeMessage,
    MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { OthelloService } from './othello.service';
import { MoveDto } from './dto/play-move.dto';

/* -------------------------------------------------------------------------- */

@WebSocketGateway({ cors: { origin: '*' } })
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server!: Server;
    constructor(private readonly othelloService: OthelloService) {}

    /* -------------------------------------------------------------------------- */
    /*  Connexion / déconnexion                                                   */
    /* -------------------------------------------------------------------------- */

    handleConnection(client: Socket) {

        console.log(`${new Date().toISOString()} by: client Conect(${client.id}) to: Othello engine`);
    }

    handleDisconnect(client: Socket) {
        
        console.log(`${new Date().toISOString()} by: client Disconect(${client.id}) to: Othello engine`);

        const userId = client.data.userId || client.handshake.query.userId as string;
        if (userId) {
            
            this.othelloService.OnlineRemovePlayerFromQueue(userId);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Mode Local                                                                */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('crateLocal')
    handleLocalCreateGame(@ConnectedSocket() client: Socket) {
        const userId = client.data.userId as string;
        const gameId = this.othelloService.localCreateGame(userId);

        client.join(gameId);
        const initialState = this.othelloService.getGameState(gameId);
        client.emit('gameState', initialState);
    }

    @SubscribeMessage('localplayMove')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    handleLocalPlayMove( @MessageBody() payload: { gameId: string; move: { row: number; col: number } }, @ConnectedSocket() client: Socket ) {
        try {
            const updatedState = this.othelloService.localPlayMove(payload.gameId, payload.move);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error: any) {
            client.emit('moveRejected', { message: error.message });
        }
    }

    @SubscribeMessage('localGiveUp')
    handleLocalGiveUp( @MessageBody() payload: { gameId: string; color: string }, @ConnectedSocket() client: Socket ) {
        try {
            const updatedState = this.othelloService.localGiveUp(payload.gameId, payload.color as any);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Mode Bot                                                                  */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('createBotGame')
    async handleCreateBotGame( @MessageBody() payload: { color?: 'BLACK' | 'WHITE' }, @ConnectedSocket() client: Socket ) {
        try {
            const userId = client.data.userId as string;
            const chosenColor = payload?.color || 'BLACK';

            const gameId = this.othelloService.computeCreateGame(userId, chosenColor);
            client.join(gameId);

            const initialState = this.othelloService.getGameState(gameId);
            client.emit('gameState', initialState);

            if (chosenColor === 'WHITE') {
                this.server.to(gameId).emit('botThinking', { gameId });

                setTimeout(async () => {
                    try {
                        const updatedState = await this.othelloService.botPlayTurn(gameId);
                        this.server.to(gameId).emit('gameState', updatedState);
                    } catch (botError: any) {
                        this.server.to(gameId).emit('botError', { message: botError.message });
                    }
                }, 800);
            }
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    @SubscribeMessage('computePlayMove')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async handleComputePlayMove( @MessageBody() payload: { gameId: string; move: { row: number; col: number } }, @ConnectedSocket() client: Socket ) {
        try {
            const userId = client.data.userId as string;

            const humanState = await this.othelloService.humanPlayMove(payload.gameId, payload.move, userId);
            this.server.to(payload.gameId).emit('gameState', humanState);

            if (humanState.status === 'FINISHED') return;

            this.server.to(payload.gameId).emit('botThinking', { gameId: payload.gameId });

            setTimeout(async () => {
                try {
                    const finalState = await this.othelloService.botPlayTurn(payload.gameId);
                    this.server.to(payload.gameId).emit('gameState', finalState);
                } catch (botError: any) {
                    this.server.to(payload.gameId).emit('botError', { message: botError.message });
                }
            }, 700);

        } catch (error: any) {
            client.emit('moveRejected', { message: error.message });
        }
    }

    @SubscribeMessage('botGiveUp')
    handleBotGiveUp(@MessageBody() payload: { gameId: string }, @ConnectedSocket() client: Socket) {
        try {
            const updatedState = this.othelloService.botGiveUp(payload.gameId);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Mode Online (Matchmaking & PvP réseau)                                    */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('joinOnlineQueue')
    async handleJoinOnlineQueue( @MessageBody() payload: { color?: 'BLACK' | 'WHITE' }, @ConnectedSocket() client: Socket ) {
        try {
            const userId = client.data.userId || client.handshake.query.userId as string;
            if (!userId) {
                client.emit('gameError', { message: 'Utilisateur non authentifié' });
                return;
            }

            const hostPlayer = {
                userId,
                socketId: client.id,
                color: payload?.color,
            };

            const result = await this.othelloService.OnlineCreateGame(hostPlayer);

            if (result.roomStatus === 'waiting') {
                // Le premier joueur rejoint sa room d'attente
                client.join(result.roomId!);
                client.emit('waitingForOpponent', { roomId: result.roomId });
            } else if (result.roomStatus === 'ready' && result.gameId) {
                // Le second joueur rejoint la room d'attente pour récupérer son ID
                client.join(result.roomId!);

                // Récupération de l'état du jeu créé
                const gameState = this.othelloService.getGameState(result.gameId);

                // 🔑 CORRECTION CRUCIALE :
                // On fait joindre la nouvelle room de jeu (gameId) aux deux sockets présents dans la room d'attente,
                // OU on diffuse directement à toute la room d'attente (résultat.roomId) pour que player1 ET player2 soient notifiés !

                // Fait basculer tout le monde de la room d'attente vers la room du jeu
                this.server.to(result.roomId!).emit('matchFound', gameState);

                // Optionnel : faire rejoindre explicitement les clients à la room du jeu
                const socketsInRoom = await this.server.in(result.roomId!).fetchSockets();
                for (const s of socketsInRoom) {
                    s.join(result.gameId);
                }
            }
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    @SubscribeMessage('onlinePlayMove')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async handleOnlinePlayMove( @MessageBody() payload: { gameId: string; move: { row: number; col: number } }, @ConnectedSocket() client: Socket ) {
        
        try {
            const userId = client.data.userId || client.handshake.query.userId as string;
            const updatedState = await this.othelloService.onlinePlayMove(payload.gameId, payload.move, userId);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error: any) {
            client.emit('moveRejected', { message: error.message });
        }
    }

    @SubscribeMessage('onlineGiveUp')
    async handleOnlineGiveUp( @MessageBody() payload: { gameId: string }, @ConnectedSocket() client: Socket ) {
        try {
            const userId = client.data.userId || client.handshake.query.userId as string;
            const updatedState = await this.othelloService.onlineGiveUp(payload.gameId, userId);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Mode Bot Stream (Bot vs Bot)                                              */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('createBotStreamGame')
    async handleCreateBotStreamGame(@ConnectedSocket() client: Socket) {
        try {
            const gameId = this.othelloService.createBotVsBotGame();
            client.join(gameId);

            const initialState = this.othelloService.getGameState(gameId);
            client.emit('gameState', initialState);

            this.runBotStreamLoop(gameId);
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }

    private runBotStreamLoop(gameId: string) {
        const interval = setInterval(async () => {
            try {
                const state = this.othelloService.getGameState(gameId);

                if (state.status === 'FINISHED') {
                    clearInterval(interval);
                    return;
                }

                this.server.to(gameId).emit('botThinking', { gameId });

                setTimeout(async () => {
                    const updatedState = await this.othelloService.botVsBotPlayTurn(gameId);
                    this.server.to(gameId).emit('gameState', updatedState);

                    if (updatedState.status === 'FINISHED') {
                        clearInterval(interval);
                    }
                }, 800);

            } catch (error) {
                clearInterval(interval);
            }
        }, 2000);
    }

    /* -------------------------------------------------------------------------- */
    /*  Gestion globale de l'état (Reconnexion / F5)                              */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('getGameState')
    handleGetGameState( @ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string } ) {
        try {
            const userId = client.data.userId || client.handshake.query.userId as string;
            if (!userId) {
                client.emit('gameError', { message: 'Utilisateur non authentifié' });
                return;
            }

            const state = this.othelloService.getGameState(data.gameId);

            const isUserInGame = state.players.some(p => p.userId === userId);
            if (!isUserInGame) {
                client.emit('gameError', { message: "Vous ne faites pas partie de cette partie." });
                return;
            }

            client.join(data.gameId);
            client.emit('gameState', state);
        } catch (error: any) {
            client.emit('gameError', { message: error.message });
        }
    }
}