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
@WebSocketGateway({
  cors: {
    origin: [
      // 'http://localhost:5173,',
      // 'https://localhost:8443',
      '*',
    ],
    // credentials: true, // if cookies/sessions over the sockets
  },
  namespace: '/spectator',
})
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
    console.log(
      `${new Date().toISOString()} by: client Connect(${client.id}) to: Spectator Feed. Total: ${this.connectedSpectators}`,
    );
  }
  handleDisconnect(client: Socket) {
    this.connectedSpectators--;
    if (this.connectedSpectators < 0) this.connectedSpectators = 0;
    console.log(
      `${new Date().toISOString()} by: client Disconnect(${client.id}) to: Spectator Feed. Total: ${this.connectedSpectators}`);
  }

  // fontend calls this when the Watch component nounts
  @SubscribeMessage('requestLiveGames')
  async handleRequestLiveGames(client: Socket) {
    const liveGames = await this.spectatorService.getVisibleGames();

    // send the array only to the client who requested it
    client.emit('liveGamesList', liveGames);
  }

  // call this method from OthelloService whenever a move is played
  public async broadcastGameUpdate(gameId: string) {
    // update the main /watch list
    const liveGames = await this.spectatorService.getVisibleGames();
    // broadcast the updated array to ALL connected spectators
    this.server.emit('liveGamesList', liveGames);

    // push the update to its dedicated room if specific game
    // if (gameId) {
    const singleGame = await this.spectatorService.getSingleGame(gameId);
    if (singleGame) {
      this.server
        .to(`spectator_${gameId}`)
        .emit('spectatorGameState', singleGame);
      // }
    }
  }
}

// @SubscribeMessage('eventName') : Écoute un événement personnalisé (ex: makeMove).
