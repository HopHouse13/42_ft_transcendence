/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { WebSocketServer }  from 'websockets';
import { SubscribeMessage } from 'websockets';
import { MessageBody } from 'websockets';
import { ConnectedSocket } from 'websockets';
import { OnGatewayDisconnect } from 'websockets';

import { Server, Socket } from 'socket.io';

import { OthelloService } from './othello.service';
import type { Move } from './interfaces/move-result.interface';

/* ========================================================================== */

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

//@WebsocketGateway({ cors: {origin: '*' } })

export class OthelloGateway implements OnGatewayDisconnect   {

  @WebSocketServer()
  server!: Server;

  private readonly connections = new Map<string, { gameId: string; userId: string }>();

/*      ~~ ~~     */
  
  constructor(private readonly othelloService: OthelloService) {}

  @SubscribeMessage('createGame')
  handleCreateGame( @MessageBody() payload: CreateGamePayload, @ConnectedSocket() client: Socket )   {

    const state =this.othelloService.createGame(payload.userId);
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
