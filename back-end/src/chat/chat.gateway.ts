/* ========================================================================== */
/*                                                                            */
/*      ~~ Gateway temps réel : protocol ws pour le service chat. ~~          */
/*                                                                            */
/* ========================================================================== */

import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

/* -------------------------------------------------------------------------- */
/*  CORS: à restreindre à l'origine réelle du front en prod (pas '*').        */
/* -------------------------------------------------------------------------- */

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway { 

  @WebSocketServer() server: Server;

  constructor( private readonly chatService: ChatService ) {}

    /* -------------------------------------------------------------------------- */

  handleConnection(client: Socket) {

      //console.log(`Client connecté ChatRoom: ${client.id}`);
  }

  handleDisconnect(client: Socket)  {

      //console.log(`Client déconnecté ChatRoom: ${client.id}`);
  }

    /* -------------------------------------------------------------------------- */

  // 1. Accepte gameId sous forme de string OU d'objet { gameId }
  @SubscribeMessage('joinRoom')
  handleJoinRoom( @MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket ): void {
  
    const roomId = typeof payload === 'string' ? payload : payload?.roomId;
    if (!roomId) return;

    client.join(roomId);

    
    const history = this.chatService.getChatRoom(roomId); // Envoi de l'historique au client qui vient de rejoindre
    client.emit('allMessages', history);
  }

  // 2. Transmet le senderId (userId de l'utilisateur ou client.id en secours)
  @SubscribeMessage('sendMessage')
  handleMessage( @MessageBody() payload: { roomId: string; text: string }, @ConnectedSocket() client: Socket ): void {
    
    if (!payload?.roomId || !payload?.text?.trim()) return;

    // TODO: Extraire le véritable ID depuis la session JWT (client.data.user.id)
    // Récupération du userId passé lors du handshake/query
    const userId = (client.handshake.query.userId as string) || client.id;
    const newMessage = this.chatService.newMessage(payload.roomId, payload.text, userId);

      // Diffusion à l'ensemble de la room (y compris l'émetteur)
    this.server.to(payload.roomId).emit('newMessage', newMessage);
  }

}