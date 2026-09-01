import { Module } from '@nestjs/common';

import { OthelloController } from './othello.controller';
import { OthelloService } from './othello.service';
import { OthelloGateway } from './othello.gateway';

@Module({
 
  controllers:  [OthelloController],
  providers:    [OthelloGateway, OthelloService],
  exports:      [OthelloService],

})
export class OthelloModule {}
