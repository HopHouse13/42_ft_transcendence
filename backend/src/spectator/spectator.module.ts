import { Module } from '@nestjs/common';
import { OthelloModule } from '../othello/othello.module';
import { SpectatorService } from './spectator.service';
import { SpectatorGateway } from './spectator.gateway';

@Module({
  imports: [OthelloModule],
  providers: [SpectatorService, SpectatorGateway],
})
export class SpectatorModule {}
