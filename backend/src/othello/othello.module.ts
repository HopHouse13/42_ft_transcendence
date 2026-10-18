// othello.module.ts
import { Module } from '@nestjs/common';
import { OthelloController } from './othello.controller';
import { OthelloService } from './othello.service';
import { OthelloGateway } from './othello.gateway';

import { PrismaModule } from '../prisma/prisma.module';

import { ComputePlayerModule } from '../compute-player/compute-player.module';
import { GameRoomModule } from '../game-room/game-room.module';

import { AchievementModule } from '../achievement/achievement.module'; 

@Module({
  imports: [PrismaModule, ComputePlayerModule, GameRoomModule, AchievementModule],
  providers: [OthelloService, OthelloGateway],
})
export class OthelloModule {}
