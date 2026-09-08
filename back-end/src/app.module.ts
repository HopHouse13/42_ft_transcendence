import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

import { OthelloModule } from './othello/othello.module';
import { GameRoomModule } from './game-room/game-room.module';

import { PrismaService } from './prisma/prisma.service';
import { OthelloService } from './othello/othello.service';

@Module({

  imports: [PrismaModule, UsersModule, OthelloModule, GameRoomModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, OthelloService],
})
export class AppModule {}
