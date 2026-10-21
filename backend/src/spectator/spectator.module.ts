// declaration des dependances
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SpectatorService } from './spectator.service';
import { SpectatorGateway } from './spectator.gateway';

@Module({
  imports: [PrismaModule],
  providers: [SpectatorService, SpectatorGateway],
  exports: [SpectatorGateway], // for use in OthelloService
})
export class SpectatorModule {}
