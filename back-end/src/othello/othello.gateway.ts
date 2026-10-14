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


/* -------------------------------------------------------------------------- */

// Namespace par défaut ('/') : le front fait io(window.location.origin)
// à restreindre en prod (ton front uniquement)
@WebSocketGateway({ cors: { origin: '*' } })
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    constructor(private readonly othelloService: OthelloService) {}

    /* -------------------------------------------------------------------------- */
    /*  Connexion / déconnexion                                                   */
    /* -------------------------------------------------------------------------- */

    handleConnection(client: Socket) {
        
        console.log(`${new Date().toISOString()} by: client Conect(${client.id}) to: Othello engine`);
    }

    handleDisconnect(client: Socket) {
        
        console.log(`${new Date().toISOString()} by: client Disconect(${client.id}) to: Othello engine`);
    }

    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('crateLocal')
    handleLocalCreateGame(@ConnectedSocket() client: Socket) {
        
        const userId = client.data.userId as string;
        const gameId = this.othelloService.localCreateGame(userId);
        
        // Optionnel : faire rejoindre une room Socket.io au client pour ce jeu
        client.join(gameId);
        
        const initialState = this.othelloService.getGameState(gameId);
        client.emit('gameState', initialState);
    }

    @SubscribeMessage('localplayMove') 
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    handleLocalPlayMove( @MessageBody() payload: { gameId: string; move: { row: number; col: number } }, @ConnectedSocket() client: Socket ) {
    
        try {
            // La gateway délère 100% de la logique au service
            const updatedState = this.othelloService.localPlayMove(payload.gameId, payload.move);

            // Diffusion du résultat à la room
            this.server.to(payload.gameId).emit('gameState', updatedState);

        } catch (error) {
            client.emit('moveRejected', { message: error.message });
        }
    }

    @SubscribeMessage('localGiveUp')
    handleLocalGiveUp( @MessageBody() payload: { gameId: string; color: string }, @ConnectedSocket() client: Socket ) {
        
        try {
            const updatedState = this.othelloService.localGiveUp(payload.gameId, payload.color as any);
            
            // Diffuser le nouvel état (marqué FINISHED) à tous les joueurs de la room
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error) {
            client.emit('gameError', { message: error.message });
        }
    }

        /* -------------------------------------------------------------------------- */

    @SubscribeMessage('createBotGame')
    handleCreateBotGame(@ConnectedSocket() client: Socket) {
        try {
            const userId = client.data.userId as string;
            
            // 1. Créer la partie bot via le service
            const gameId = this.othelloService.computeCreateGame(userId);
            
            // 2. Faire rejoindre la room Socket.io au client
            client.join(gameId);

            // 3. Récupérer et envoyer l'état initial
            const initialState = this.othelloService.getGameState(gameId);
            client.emit('gameState', initialState);

        } catch (error) {
            client.emit('gameError', { message: error.message });
        }
    }

    @SubscribeMessage('computePlayMove')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async handleComputePlayMove( @MessageBody() payload: { gameId: string; move: { row: number; col: number } }, @ConnectedSocket() client: Socket ) {
        try {
            const userId = client.data.userId as string;
            
            // --- ÉTAPE 1 : Jouer le coup de l'humain et émettre l'état intermédiaire ---
            const humanState = await this.othelloService.humanPlayMove(payload.gameId, payload.move, userId);
            this.server.to(payload.gameId).emit('gameState', humanState);

            // Si la partie est déjà finie après le coup de l'humain, on s'arrête là
            if (humanState.status === 'FINISHED') return;

            // Optionnel : Notifier le front que le bot réfléchit (si ton front écoute 'botThinking')
            this.server.to(payload.gameId).emit('botThinking', { gameId: payload.gameId });

            // --- ÉTAPE 2 : Attendre un court instant, puis jouer le coup du bot et émettre le résultat ---
            setTimeout(async () => {
                try {
                    const finalState = await this.othelloService.botPlayTurn(payload.gameId);
                    
                    // Émettre le résultat final du bot vers la room
                    this.server.to(payload.gameId).emit('gameState', finalState);
                } catch (botError) {
                    this.server.to(payload.gameId).emit('botError', { message: botError.message });
                }
            }, 700); // Délai de 700ms pour simuler la réflexion naturelle du bot

        } catch (error) {
            client.emit('moveRejected', { message: error.message });
        }
    }

    @SubscribeMessage('botGiveUp')
    handleBotGiveUp(@MessageBody() payload: { gameId: string }, @ConnectedSocket() client: Socket) {
        try {
            const updatedState = this.othelloService.botGiveUp(payload.gameId);
            this.server.to(payload.gameId).emit('gameState', updatedState);
        } catch (error) {
            client.emit('gameError', { message: error.message });
        }
    }
        /* -------------------------------------------------------------------------- */

    @SubscribeMessage('getGameState')
    handleGetGameState( @ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string } ) {
        
        try {
        
            const state = this.othelloService.getGameState(data.gameId);
            client.join(data.gameId);
            client.emit('gameState', state);
        
        } catch (error) {
        
            client.emit('gameError', { message: error.message });
        
        }
    }

        /* -------------------------------------------------------------------------- */

}
