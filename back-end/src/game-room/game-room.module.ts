import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';

@Module({
  providers: [GameRoomService],
  controllers: [GameRoomController]
})
export class GameRoomModule {}
