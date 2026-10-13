/* ========================================================================== */
/*                                                                            */
/*              ~~ ChatService: code metier pour le chatRoom ~~               */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

/* -------------------------------------------------------------------------- */

// chat.service.ts
export class Message {

  id:       number;
  text:     string;
  userId:   string;
  roomId:   string;
}

/* -------------------------------------------------------------------------- */
/*                         ~~ Class ChatService ~~                            */
/*                                                                            */
/* cette classe utilmise une map qui contien des tableaux de message          */
/* liée pars des ID unique                                                    */
/* -------------------------------------------------------------------------- */

@Injectable()
export class ChatService { 
  
  private readonly chatRooms = new Map<string, Message[]>();

  /* -------------------------------------------------------------------------- */


  newMessage(roomId: string, text: string, userId: string): Message {
    
    if ( !this.chatRooms.has(roomId) ) {
    
      this.chatRooms.set(roomId, []);
    }

    // Le "!" informe TypeScript que le tableau existe obligatoirement ici
    const messages = this.chatRooms.get(roomId)!;
    const newMessage: Message = { id: Date.now(), text, userId, roomId };

    messages.push(newMessage);

    console.log(text);
    return( newMessage );
  }

  /* ---------------------------- GET/SET for chatRoom ---------------------- */

  getChatRoom(roomId: string): Message[] {

    return( this.chatRooms.get(roomId) || [] );
  }

  setChatRoom(): string {

    const roomId = randomUUID(); this.chatRooms.set(roomId, []);    
    
    return( roomId );
  }


}
