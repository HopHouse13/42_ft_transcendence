import { Module } from '@nestjs/common';
import { OthelloController } from './othello.controller';
import { OthelloService } from './othello.service';

@Module({
  controllers: [OthelloController],
  providers: [OthelloService],
})
export class OthelloModule {}
