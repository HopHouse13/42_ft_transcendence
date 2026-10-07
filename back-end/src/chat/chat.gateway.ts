/* ========================================================================== */
/*                                                                            */
/*      ~~ Gateway temps réel : protocol ws pour le service chat. ~~          */
/*                                                                            */
/* ========================================================================== */

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 1. Accepte gameId sous forme de string OU d'objet { gameId }
  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() payload: string | { gameId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const gameId = typeof payload === 'string' ? payload : payload?.gameId;
    if (!gameId) return;

    client.join(gameId);

    // Envoyer l'historique de cette partie uniquement
    const history = this.chatService.getMessages(gameId);
    client.emit('allMessages', history);
  }

  // 2. Transmet le senderId (userId de l'utilisateur ou client.id en secours)
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() payload: { gameId: string; text: string; senderId?: string },
    @ConnectedSocket() client: Socket,
  ): void {
    if (!payload || !payload.gameId || !payload.text) return;

    const senderId = payload.senderId || client.id;

    const newMessage = this.chatService.newMessage(
      payload.gameId,
      payload.text,
      senderId,
    );

    // Diffusion à tous les membres de la room gameId
    this.server.to(payload.gameId).emit('newMessage', newMessage);
  }
}