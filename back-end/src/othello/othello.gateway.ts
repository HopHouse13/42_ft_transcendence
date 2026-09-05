/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */
/*
import { WebSocketGateway }  from '@nestjs/websockets';
import { WebSocketServer }  from '@nestjs/websockets';
import { SubscribeMessage } from '@nestjs/websockets';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { OthelloService } from './othello.service';
import type { Move } from './types/move.type';

/* ========================================================================== */
/*
interface CreateGamePayload    {

  userId: string;
}

interface JoinGamePayload   {

  gameId: string;
  userId: string;
}

interface PlayMovePayload   {

  gameId: string;
  move: Move;
}

/* ========================================================================== */
/*
@WebSocketGateway({ cors: { origin: '*' } })
export class OthelloGateway implements OnGatewayDisconnect   {

  @WebSocketServer()
  server!: Server;

  private readonly connections = new Map<string, { gameId: string; userId: string }>();


  
  constructor(private readonly othelloService: OthelloService) {}

  @SubscribeMessage('createGame')
  handleCreateGame( @MessageBody() payload: CreateGamePayload, @ConnectedSocket() client: Socket )   {

    const state = this.othelloService.createGame(payload.userId);
    client.join(state.gameId);
    this.connections.set(client.id, { gameId: state.gameId, userId: payload.userId });
  
    return( state );
  }

  @SubscribeMessage('joinGame')
  handleJoingame( @MessageBody() payload: JoinGamePayload, @ConnectedSocket() client: Socket)    {

    const state = this.othelloService.joinGame(payload.gameId, payload.userId);
    client.join(payload.gameId);
    this.connections.set(client.id, { gameId: payload.gameId, userId: payload.userId });
    this.server.to(payload.gameId).emit('gameUpdated', state);

    return( state );
  }

  @SubscribeMessage('playMove')
  handlePlayMove( @MessageBody() payload: PlayMovePayload, @ConnectedSocket() client: Socket )   {
  
    const connection = this.connections.get(client.id);
    if (!connection || connection.gameId !== payload.gameId)  {

      return( { valid: false, reason: 'Vous ne faites pas partie de cette partie' } );
    }

    const result = this.othelloService.playMove( payload.gameId, connection.userId, payload.move );
    this.server.to(payload.gameId).emit('moveResult', result);

    return( result );
  }

  handleDisconnect(client: Socket)    {

    const connection = this.connections.get(client.id);
    if (!connection) return;

    this.othelloService.markDisconnected(connection.gameId, connection.userId);
    this.server.to(connection.gameId).emit('playerDisconnected', { userId: connection.userId });
    this.connections.delete(client.id);
  }
}
*/

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { OthelloService } from './othello.service';
import { MoveDto } from './dto/play-move.dto';

interface JoinGamePayload {
  gameId: string;
  userId: string;
}

interface PlayMovePayload {
  gameId: string;
  userId: string;
  move: MoveDto;
}

@WebSocketGateway({
  cors: { origin: '*' }, // à restreindre en prod (ton front uniquement)
  namespace: 'othello',
})
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly othelloService: OthelloService) {}

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
    // Optionnel: retrouver quel joueur/quelle partie correspond à ce socket
    // (nécessite de stocker la correspondance socket.id <-> userId/gameId, voir plus bas)
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() payload: JoinGamePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, userId } = payload;

    client.join(gameId); // le socket rejoint la room de la partie

    const state = await this.othelloService.getState(gameId);

    // Notifie tout le monde dans la room (y compris celui qui rejoint)
    this.server.to(gameId).emit('gameState', state);
  }

  @SubscribeMessage('playMove')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handlePlayMove(
    @MessageBody() payload: PlayMovePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, userId, move } = payload;

    try {
      const result = this.othelloService.playMove(gameId, userId, move);

      // Diffuse le résultat à tous les joueurs de la partie
      this.server.to(gameId).emit('moveResult', result);

    } catch (err) {
      // N'envoie l'erreur qu'à celui qui a joué le coup invalide,
      // pas à toute la room
      client.emit('moveError', { message: err.message });
    }
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @MessageBody() payload: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, userId } = payload;

    this.othelloService.markDisconnected(gameId, userId);
    client.leave(gameId);

    this.server.to(gameId).emit('playerLeft', { userId });
  }
}
