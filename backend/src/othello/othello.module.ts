// othello.module.ts
import { Module } from '@nestjs/common';
import { OthelloController } from './othello.controller';
import { OthelloService } from './othello.service';
import { OthelloGateway } from './othello.gateway';

import { PrismaModule } from '../prisma/prisma.module';

import { ComputePlayerModule } from '../compute-player/compute-player.module';

@Module({
  imports: [PrismaModule, ComputePlayerModule],
  controllers: [OthelloController],
  providers: [OthelloService, OthelloGateway],
})
export class OthelloModule {}
