import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Message } from './chat.service'; // Utilisation de 'import type'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':gameId')
  getMessages(@Param('gameId') gameId: string): Message[] {
    return this.chatService.getMessages(gameId);
  }

  @Post(':gameId')
  newMessage(
    @Param('gameId') gameId: string,
    @Body('text') text: string,
    @Body('senderId') senderId: string,
  ): Message {
    return this.chatService.newMessage(gameId, text, senderId);
  }
}
