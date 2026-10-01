/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { OthelloService } from './othello.service';
import { MoveDto } from './dto/play-move.dto';

/* -------------------------------------------------------------------------- */

interface JoinGamePayload   {
    
  gameId:   string;
  userId:   string;
}

interface PlayMovePayload   {
    
  gameId:   string;
  userId:   string;
  move:     MoveDto;
}

/* -------------------------------------------------------------------------- */

// à restreindre en prod (ton front uniquement)
@WebSocketGateway( {cors: { origin: '*' }, namespace: 'othello',} )
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(private readonly othelloService: OthelloService) {}

    /* -------------------------------------------------------------------------- */
  
    handleConnection(client: Socket) {
    
        console.log(`Client connecté: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        
        console.log(`Client déconnecté: ${client.id}`);
    }

    /* -------------------------------------------------------------------------- */
    
    @SubscribeMessage('stateGame')
    async handleStateGame( @MessageBody() gameId: string, @ConnectedSocket() client: Socket )   {
        
        const state = await this.othelloService.getState(gameId);
        this.server.to(gameId).emit('gameState', state);
    }
    
    @SubscribeMessage('joinGame')
    async handleJoinGame( @MessageBody() payload: JoinGamePayload, @ConnectedSocket() client: Socket )  {
        
        const { gameId, userId } = payload;
        client.join(gameId); // le socket rejoint la room de la partie

        const state = await this.othelloService.getState(gameId);

        // Notifie tout le monde dans la room (y compris celui qui rejoint)
        this.server.to(gameId).emit('gameState', state);
    }

    @SubscribeMessage('playMove') @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async handlePlayMove( @MessageBody() payload: PlayMovePayload, @ConnectedSocket() client: Socket )    {
    
        const { gameId, userId, move } = payload;
        try {
          
            const result = this.othelloService.playMove(gameId, userId, move);
            this.server.to(gameId).emit('moveResult', result); // Diffuse le résultat à tous les joueurs de la partie

        } catch (err) {

            // N'envoie l'erreur qu'à celui qui a joué le coup invalide,
            // pas à toute la room
            client.emit('moveError', { message: err.message });
        }
    }

    @SubscribeMessage('leaveGame')
    handleLeaveGame( @MessageBody() payload: { gameId: string; userId: string }, @ConnectedSocket() client: Socket )  {
    
        const { gameId, userId } = payload;

        this.othelloService.markDisconnected(gameId, userId);
        client.leave(gameId);

        this.server.to(gameId).emit('playerLeft', { userId });
    }
    
    @SubscribeMessage('localGame')
    async handleCreateLoc( @ConnectedSocket() client: Socket, @MessageBody() payload: { color: 'black' | 'white' } ) {
      
        // 1. Création de la partie via le GameService
        const state = this.othelloService.createLocalGame(client.id);
        this.server.to(state.gameId).emit('gameState', state);
      // 2. Envoi de l'état initial
      //const gameState = await this.othelloService.getState(gameId);
      //client.emit('game:started', gameState);
//
//      // 3. Règle critique : Noir commence. Si le joueur a choisi Blanc, le bot (Noir) doit jouer de suite
//      if (payload.color === 'white') {
//         client.emit('game:botThinking'); // Info pour le front
//         // On déclenche le tour du bot sans bloquer (fire and forget côté gateway)
//         this.othelloService.playBotTurn(gameId);
//      }
    }
    
        @SubscribeMessage('playBotGame') @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
        async handlePlayMoveLoc( @MessageBody() payload: PlayMovePayload, @ConnectedSocket() client: Socket )    {
 
            const { gameId, userId, move } = payload;
            try {
              
                const result = this.othelloService.playMove(gameId, userId, move);
                this.server.to(gameId).emit('moveResult', result); // Diffuse le résultat à tous les joueurs de la partie

            } catch (err) {

                // N'envoie l'erreur qu'à celui qui a joué le coup invalide,
                // pas à toute la room
                client.emit('moveError', { message: err.message });
            }
            
            const gameState = await this.othelloService.getState(gameId);
            
            // 3. Règle critique : Noir commence. Si le joueur a choisi Blanc, le bot (Noir) doit jouer de suite
            client.emit('game:botThinking'); // Info pour le front
            const state = this.othelloService.playBotTurn(gameId);
            this.server.to(gameId).emit('gameState', state);
        }
      
    
    
}

/* -------------------------------------------------------------------------- */
/* Optionnel: retrouver quel joueur/quelle partie correspond à ce socket      */
/* (nécessite de stocker la correspondance socket.id <-> userId/gameId )      */
/* -------------------------------------------------------------------------- */
