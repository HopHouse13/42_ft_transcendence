import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

import { OthelloModule } from './othello/othello.module';
import { GameRoomModule } from './game-room/game-room.module';

@Module({

  imports: [PrismaModule, UsersModule, OthelloModule, GameRoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
