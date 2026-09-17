/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Controller, Post, Body } from '@nestjs/common';

import { GameRoomService } from './game-room.service' ;
//import type { PlayerRoom } from './game-room.service' ;
import { PlayerRoomDto }   from './dto/player-room.dto' ;
import  type { PlayerRoom }      from './interfaces/player-room.interface';


/* -------------------------------------------------------------------------- */
/*                       ~~ Class GameRoomController ~~                       */
/*                                                                            */
/* POST /game-room/entry    --> rom match par couleur                         */
/* POST /game-room/invit    --> rom match par invit                           */
/* -------------------------------------------------------------------------- */

@Controller('game-room')
export class GameRoomController     {
    
    constructor(private readonly gameRoomService: GameRoomService) {}
    
    @Post('entry')
    newPlayerEntry( @Body('player') player: PlayerRoomDto )  {
        
        return( this.gameRoomService.newPlayerEntry(player) );
    }
    
    @Post('invit')
    invitPlayerEntry( @Body('player') player: PlayerRoomDto )   {
        
        return( this.gameRoomService.invitPlayerEntry(player) );
    }
}

/* -------------------------------------------------------------------------- */
