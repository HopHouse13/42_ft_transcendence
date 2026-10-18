import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SpectatorService } from './spectator.service';

// @WebSocketGateway() : Définit une classe comme un point d’entrée pour les WebSockets.
@WebSocketGateway({ cors: true, namespace: '/spectator' })
export class SpectatorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() // @WebSocketServer() : Injecte le serveur WebSocket (Server de socket.io).
  server!: Server; // ! tells TypeScript that NestJS handles the init

  // track global spectator count here
  private connectedSpectators = 0;

  constructor(private readonly spectatorService: SpectatorService) {}

  handleConnection(client: Socket) {
    this.connectedSpectators++;
    console.log('Spectator connected. Total: ${this.connectedSpectators}');
  }
  handleDisconnect(client: Socket) {
    this.connectedSpectators--;
    if (this.connectedSpectators < 0) this.connectedSpectators = 0;
    console.log('Spectator disconnected. Total: ${this.connectedSpectators}');
  }

  // fontend calls this when the Watch component nounts
  @SubscribeMessage('requestLiveGames')
  async handleRequestLiveGames(client: Socket) {
    const liveGames = await this.spectatorService.getVisibleGames();

    // send the array only to the client who requested it
    client.emit('liveGamesList', liveGames);
  }

  // call this method from OthelloService whenever a move is played
  public async broadcastGameUpdate() {
    const liveGames = await this.spectatorService.getVisibleGames();

    // broadcast the updated array to ALL connected spectators
    this.server.emit('liveGamesList', liveGames);
  }
}

// @SubscribeMessage('eventName') : Écoute un événement personnalisé (ex: makeMove).
