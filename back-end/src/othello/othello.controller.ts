import { Controller, Param, Body, Get, Post, Patch } from '@nestjs/common';
import { OthelloService } from './othello.service';

import type { MoveResult, Move, GameResult } from './interfaces/move-result.interface';

@Controller('othello')
export class OthelloController {

    constructor(private readonly othelloService: OthelloService) {}

  // TODO: POST /othello/games (créer une partie)
  // TODO: GET /othello/games/:id (état d'une partie)
  // TODO: POST /othello/games/:id/moves (jouer un coup)
    
    @Post('create/:userId')
    async creatGame( @Param('userId') userId: string ) {
        
        //const userId = 'HostUser' ;
        return( this.othelloService.createGame(userId) );
    }
    
    @Post('join/:gameId/:userId')
    async joinGame( @Param('gameId') gameId: string,@Param('userId') userId: string ) {
        
        //const userId = 'VisitorUser'
        return( this.othelloService.joinGame(gameId, userId) );
        
    }
    
    @Patch(':gameId/:userId/move')
    async playMove(
      @Param('gameId') gameId: string,
      @Param('userId') userId: string,
      @Body() move: Move,
    ) {
      return( this.othelloService.playMove(gameId, userId, move));
    }
    
    @Get('state/:gameId')
    async getState( @Param('gameId') gameId: string ){
        
        return( this.othelloService.getState(gameId) );
    }
    

/*  @Get('ping')
  ping() {
    return this.othelloService.ping();
  }*/
}
