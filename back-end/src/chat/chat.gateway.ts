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
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 1. Le joueur rejoint le salon de sa partie
  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() gameId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(gameId); // Socket.IO ajoute ce client à la room
    
    // Envoyer l'historique de CETTE partie uniquement à ce joueur
    const history = this.chatService.getMessages(gameId);
    client.emit('allMessages', history);
  }

  // 2. Envoi de message ciblé sur la room
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() payload: { gameId: string; text: string },
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(' Message reçu sur le serveur :', payload);
    const newMessage = this.chatService.newMessage(
      payload.gameId,
      payload.text,
      client.id,
    );

    // Diffuser le message UNIQUEMENT aux joueurs présents dans la room "gameId"
    this.server.to(payload.gameId).emit('newMessage', newMessage);
  }
}
