// othello.module.ts
import { Module } from '@nestjs/common';
import { OthelloController } from './othello.controller';
import { OthelloService } from './othello.service';
import { OthelloGateway } from './othello.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OthelloController],
  providers: [OthelloService, OthelloGateway],
})
export class OthelloModule {}
