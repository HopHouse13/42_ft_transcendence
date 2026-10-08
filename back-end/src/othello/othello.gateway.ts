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

interface JoinGamePayload {
    gameId:   string;
    userId:   string;
}

interface PlayMovePayload {
    gameId:   string;
    userId?:  string;   // ignoré : on utilise l'userId du handshake (non falsifiable par le message)
    move:     MoveDto;
}

/* -------------------------------------------------------------------------- */

// Namespace par défaut ('/') : le front fait io(window.location.origin)
// à restreindre en prod (ton front uniquement)
@WebSocketGateway({ cors: { origin: '*' } })
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
    // userId -> ids des sockets ouverts (évite un forfait à tort pendant un reload)
    private readonly socketsByUser = new Map<string, Set<string>>();
    // file d'attente du matchmaking (un seul joueur en attente à la fois)
    private waiting: { userId: string; client: Socket } | null = null;

    constructor(private readonly othelloService: OthelloService) {}

    /* -------------------------------------------------------------------------- */
    /*  Connexion / déconnexion                                                   */
    /* -------------------------------------------------------------------------- */

    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string | undefined;
        if (!userId) {
            client.disconnect();
            return;
        }
        client.data.userId = userId;

        const sockets = this.socketsByUser.get(userId) ?? new Set<string>();
        sockets.add(client.id);
        this.socketsByUser.set(userId, sockets);

        // annule le forfait programmé si le joueur revient à temps
        const timer = this.disconnectTimers.get(userId);
        if (timer) { clearTimeout(timer); this.disconnectTimers.delete(userId); }

        // reload : on lui renvoie sa partie en cours
        const state = this.othelloService.getActiveGameState(userId);
        if (!state) return;

        client.join(state.gameId);
        this.othelloService.markConnected(state.gameId, userId);
        client.emit('gameState', state);

        // partie bot : si c'était au bot de jouer au moment du reload
        if (state.mode === 'BOT' && this.othelloService.isBotTurn(state.gameId)) {
            await this.runBotTurn(state.gameId);
        }
    }

    handleDisconnect(client: Socket) {
        // il quitte la file d'attente s'il y était
        if (this.waiting?.client.id === client.id) this.waiting = null;

        const userId = client.data.userId as string | undefined;
        if (!userId) return;

        // Un autre socket du même joueur est encore ouvert (ex: reload) : rien à faire
        const sockets = this.socketsByUser.get(userId);
        sockets?.delete(client.id);
        if (sockets && sockets.size > 0) return;
        this.socketsByUser.delete(userId);

        const state = this.othelloService.getActiveGameState(userId);
        if (!state) return;

        this.othelloService.markDisconnected(state.gameId, userId);

        // Partie bot : elle reste en attente, pas de forfait
        if (state.mode === 'BOT') return;

        // Dans handleDisconnect (othello.gateway.ts)
        const timer = setTimeout(async () => {
            const finalState = await this.othelloService.forfeit(state.gameId, userId);
            if (finalState) this.server.to(state.gameId).emit('gameState', finalState);
            this.disconnectTimers.delete(userId);
        }, 30_000);
        this.disconnectTimers.set(userId, timer);
    }

    /* -------------------------------------------------------------------------- */
    /*  Création de parties                                                       */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('createBotGame')
    handleCreateBotGame(@ConnectedSocket() client: Socket) {
        const userId = client.data.userId as string;
        if (this.resumeIfActive(client, userId)) return;

        // l'humain est BLACK et commence : le bot n'a rien à jouer tout de suite
        const state = this.othelloService.createLocalGame(userId);
        client.join(state.gameId);
        client.emit('matchFound', state);
    }

    @SubscribeMessage('findMatch')
    async handleFindMatch(@ConnectedSocket() client: Socket) {
        const userId = client.data.userId as string;
        if (this.resumeIfActive(client, userId)) return;

        // personne en attente (ou c'est le même joueur dans un autre onglet) : on attend
        if (!this.waiting || this.waiting.userId === userId) {
            this.waiting = { userId, client };
            client.emit('waiting', { roomId: client.id });
            return;
        }

        // un adversaire attend : on crée la partie (premier arrivé = BLACK)
        const opponent = this.waiting;
        this.waiting = null;

        try {
            const state = await this.othelloService.createGame(opponent.userId, userId);
            opponent.client.join(state.gameId);
            client.join(state.gameId);
            this.server.to(state.gameId).emit('matchFound', state);
        } catch (err) {
            opponent.client.emit('gameError', { message: err.message });
            client.emit('gameError', { message: err.message });
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Jouer un coup                                                             */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('playMove') @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async handlePlayMove(@MessageBody() payload: PlayMovePayload, @ConnectedSocket() client: Socket) {
        const userId = client.data.userId as string;   // jamais celui du message
        const { gameId, move } = payload;

        try {
            const result = this.othelloService.playMove(gameId, userId, move);
            this.server.to(gameId).emit('moveApplied', result);
        } catch (err) {
            // seul celui qui a joué reçoit l'erreur
            client.emit('moveRejected', { message: err.message });
            return;
        }

        // partie bot : c'est maintenant au bot de jouer
        if (this.othelloService.isBotTurn(gameId)) {
            await this.runBotTurn(gameId);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Utilitaires                                                               */
    /* -------------------------------------------------------------------------- */

    /** Fait jouer le bot et diffuse l'état complet (le front masque "botThinking" à la réception). */
    private async runBotTurn(gameId: string): Promise<void> {
        this.server.to(gameId).emit('botThinking');
        try {
            const state = await this.othelloService.playBotTurn(gameId);
            if (state) this.server.to(gameId).emit('gameState', state);
        } catch (err) {
            this.server.to(gameId).emit('botError', { message: err.message });
        }
    }

    /** Si le joueur a déjà une partie en cours, on la lui renvoie au lieu d'en créer une autre. */
    private resumeIfActive(client: Socket, userId: string): boolean {
        const active = this.othelloService.getActiveGameState(userId);
        if (!active) return false;

        client.join(active.gameId);
        client.emit('gameState', active);
        return true;
    }

    /** Si un jouer decide de give up */
    @SubscribeMessage('forfeit')
    async handleForfeit( @MessageBody() payload: { gameId: string }, @ConnectedSocket() client: Socket ) { 
        
        const userId = client.data.userId as string;
        const { gameId } = payload;

        try {
        
            const finalState = await this.othelloService.forfeit(gameId, userId);
            if (finalState) {

                this.server.to(gameId).emit('gameState', finalState);
            }
        
        } catch (err) {
            client.emit('gameError', { message: err.message });
        }
    }

    /* -------------------------------------------------------------------------- */
    /*  Anciens events (inchangés)                                                */
    /* -------------------------------------------------------------------------- */

    @SubscribeMessage('stateGame')
    async handleStateGame(@MessageBody() gameId: string) {
        const state = await this.othelloService.getState(gameId);
        this.server.to(gameId).emit('gameState', state);
    }

    @SubscribeMessage('joinGame')
    async handleJoinGame( @MessageBody() payload: string | JoinGamePayload, @ConnectedSocket() client: Socket ) { 
        
        const gameId = typeof payload === 'string' ? payload : payload?.gameId;
        if (!gameId) return;

        const isAlreadyInRoom = client.rooms.has(gameId);
        client.join(gameId);

        // Ne renvoie le gameState que si la socket n'était PAS encore dans la room
        if (!isAlreadyInRoom) {
            try {
                const state = await this.othelloService.getState(gameId);
                client.emit('gameState', state);
            } catch (err) {
                client.emit('gameError', { message: err.message });
            }
        }
    }

    @SubscribeMessage('leaveGame')
    handleLeaveGame(@MessageBody() payload: { gameId: string; userId: string }, @ConnectedSocket() client: Socket) {
        const { gameId, userId } = payload;

        this.othelloService.markDisconnected(gameId, userId);
        client.leave(gameId);

        this.server.to(gameId).emit('playerLeft', { userId });
    }
}
