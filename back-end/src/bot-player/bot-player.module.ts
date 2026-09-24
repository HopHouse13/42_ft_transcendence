import { Module } from '@nestjs/common';
import { BotPlayerService } from './bot-player.service';
import { BotPlayerController } from './bot-player.controller';
import { BotPlayerGateway } from './bot-player.gateway';

@Module({
  providers: [BotPlayerService, BotPlayerGateway],
  controllers: [BotPlayerController]
})
export class BotPlayerModule {}
