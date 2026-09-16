import { Controller, Param, Body, Get, Post, Patch, Delete } from '@nestjs/common';
import { OthelloService } from './othello.service';

import { ParseUUIDPipe } from '@nestjs/common';
import { MoveDto } from './dto/play-move.dto';

import type { Move } from './types/move.type' ;
import type { MoveResult } from './interfaces/move-result.interface';
import type { GameResult } from './interfaces/game-result.interface';


@Controller('engine')
export class OthelloController {

    constructor(private readonly othelloService: OthelloService) {}

  // TODO: POST /othello/games (créer une partie)
  // TODO: GET /othello/games/:id (état d'une partie)
  // TODO: POST /othello/games/:id/moves (jouer un coup)
    
    @Get()
    async findAll() {
        return this.othelloService.findAll();
    }
    
    @Get(':gameId')
    async getState( @Param('gameId', ParseUUIDPipe) gameId: string ){
        
        return( this.othelloService.getState(gameId) );
    }
    
    @Post('/:hostId/:visitorId')
    async creatGame( @Param('hostId', ParseUUIDPipe) hostId: string,
                    @Param('visitorId', ParseUUIDPipe) visitorId: string ) {
        
        //const userId = 'HostUser' ;
        return( this.othelloService.createGame(hostId, visitorId) );
    }
    
    @Patch('move/:gameId/:userId')
    async playMove(
      @Param('gameId', ParseUUIDPipe) gameId: string,
      @Param('userId', ParseUUIDPipe) userId: string,
      @Body() move: MoveDto,
    ) {
      return( this.othelloService.playMove(gameId, userId, move));
    }

    @Delete(':gameId')
    async remove(@Param('gameId', ParseUUIDPipe) gameId: string) {
        return this.othelloService.remove(gameId);
    }
    
/*  @Get('ping')
  ping() {
    return this.othelloService.ping();
  }*/
}
