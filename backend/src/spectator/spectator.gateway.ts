import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SpectatorGateway {
  @WebSocketServer()
  server: Server;
  socket: Socket;
}
