/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Controller, Post, Get, Param, Body } from '@nestjs/common';

import { GameRoomService } from './game-room.service';
import type { PlayerRoom } from './game-room.service';

/* -------------------------------------------------------------------------- */
/*                       ~~ Class GameRoomController ~~                       */
/*                                                                            */
/* POST /game-room/entry          --> rom match par couleur                   */
/* POST /game-room/invit          --> rom match par invit                     */
/* GET  /game-room/status/:roomId --> polling pour le joueur en attente       */
/* -------------------------------------------------------------------------- */

@Controller('game-room')
export class GameRoomController     {
    
    constructor(private readonly gameRoomService: GameRoomService) {}
    
    @Post('entry')
    newPlayerEntry( @Body('player') player: PlayerRoom )  {
        
        return( this.gameRoomService.newPlayerEntry(player) );
    }
    
    @Post('invit')
    invitPlayerEnty( @Body('player')player: PlayerRoom )   {
        
        return( this.gameRoomService.invitPlayerEnty(player) );
    }

    // ✅ Route de polling : le joueur qui attend (player1) interroge
    // régulièrement son roomId d'origine pour savoir si un adversaire
    // l'a rejoint et si la partie a démarré.
    @Get('status/:roomId')
    getStatus( @Param('roomId') roomId: string )   {

        const game = this.gameRoomService.getMatchResult(roomId);

        if (game) {
            return( { status: 'ready', game } );
        }

        return( { status: 'waiting' } );
    }
}
