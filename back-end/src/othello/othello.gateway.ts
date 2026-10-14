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
    async handleCreateBotGame( 
        @MessageBody() payload: { color?: 'BLACK' | 'WHITE' }, 
        @ConnectedSocket() client: Socket 
    ) {
        try {
            const userId = client.data.userId as string;
            const chosenColor = payload?.color || 'BLACK'; // Par défaut BLACK si non spécifié
            
            // 1. Créer la partie bot en passant la couleur choisie
            const gameId = this.othelloService.computeCreateGame(userId, chosenColor);
            
            // 2. Faire rejoindre la room Socket.io au client
            client.join(gameId);

            // 3. Récupérer et envoyer l'état initial (plateau vide)
            const initialState = this.othelloService.getGameState(gameId);
            client.emit('gameState', initialState);

            // 4. SI L'HUMAIN A CHOISI BLANC : le bot (Noir) doit commencer
            if (chosenColor === 'WHITE') {
                // Optionnel : Indiquer au front que le bot réfléchit
                this.server.to(gameId).emit('botThinking', { gameId });

                // Petit délai pour laisser le temps au front d'afficher le plateau initial
                setTimeout(async () => {
                    try {
                        // On réutilise la méthode existante botPlayTurn du service !
                        const updatedState = await this.othelloService.botPlayTurn(gameId);
                        
                        // Diffuser le résultat du premier coup du bot à la room
                        this.server.to(gameId).emit('gameState', updatedState);
                    } catch (botError) {
                        this.server.to(gameId).emit('botError', { message: botError.message });
                    }
                }, 800);
            }

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
    
    @SubscribeMessage('startBotStream')
    async handleStartBotStream(@ConnectedSocket() client: Socket) {
        // 1. Créer une partie en mode spectateur / bot vs bot
        const gameId = this.othelloService.createBotVsBotGame(); 
        client.join(gameId);

        // 2. Envoyer l'état initial
        const initialState = this.othelloService.getGameState(gameId);
        client.emit('gameState', initialState);

        // 3. Lancer une boucle automatique sur le serveur pour faire jouer les bots un par un
        this.runBotStreamLoop(gameId);
    }

    private async runBotStreamLoop(gameId: string) {
        const interval = setInterval(async () => {
            try {
                const state = this.othelloService.getGameState(gameId);
                
                // Si la partie est finie, on arrête la boucle
                if (state.status === 'FINISHED') {
                    clearInterval(interval);
                    return;
                }

                // Faire jouer le bot dont c'est le tour
                const updatedState = await this.othelloService.botPlayTurn(gameId);
                
                // Diffuser à TOUS les spectateurs connectés dans la room du stream
                this.server.to(gameId).emit('gameState', updatedState);

            } catch (error) {
                clearInterval(interval);
            }
        }, 1500); // Un coup toutes les 1.5 secondes pour que ce soit agréable à regarder
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
