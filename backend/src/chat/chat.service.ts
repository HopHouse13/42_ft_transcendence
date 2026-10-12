/* ========================================================================== */
/*                                                                            */
/*              ~~ ChatService: code metier pour le chatBox ~~                */
/*                                                                            */
/* ========================================================================== */
import { Injectable } from '@nestjs/common';

// chat.service.ts
export class Message {
  id: number;
  text: string;
  senderId: string;
  gameId: string;
}

@Injectable()
export class ChatService {
  private readonly gamesMessages = new Map<string, Message[]>();

  newMessage(gameId: string, text: string, senderId: string): Message {
    if (!this.gamesMessages.has(gameId)) {
      this.gamesMessages.set(gameId, []);
    }

    // Le "!" informe TypeScript que le tableau existe obligatoirement ici
    const messages = this.gamesMessages.get(gameId)!;

    const newMessage: Message = {
      id: Date.now(),
      text,
      senderId,
      gameId,
    };

    messages.push(newMessage);
    return newMessage;
  }

  getMessages(gameId: string): Message[] {
    return this.gamesMessages.get(gameId) || [];
  }
}
