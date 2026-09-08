/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

/*import { Controller, Post, Body } from '@nestjs/common';

import { GameRoomService } from './game-room.service';
import type { PlayerRoom } from './game-room.service';

/* -------------------------------------------------------------------------- */
/*                       ~~ Class GameRoomController ~~                       */
/*                                                                            */
/* POST /game-room/entry    --> rom match par couleur                         */
/* POST /game-room/invit    --> rom match par invit                           */
/* -------------------------------------------------------------------------- */

/*@Controller('game-room')
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
}

/* -------------------------------------------------------------------------- */
import { Controller, Post, Body } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { GameRoomService, PlayerRoom } from './game-room.service';
import { JoinGameDto } from './dto/join-game.dto';

/* ==========================================================================
   ⚠️ CONTROLLER TEMPORAIRE ⚠️
   Le vrai design (voir socketId dans PlayerRoom) prévoit du WebSocket
   via game-room.gateway.ts. Ce controller REST sert juste à tester le
   matchmaking depuis le front en attendant que le gateway soit fait.
   À supprimer / remplacer une fois le WebSocket branché.
   ========================================================================== */

@Controller('game-room')
export class GameRoomController {
  constructor(private readonly gameRoomService: GameRoomService) {}

  @Post('join')
  async join(@Body() dto: JoinGameDto) {
    const player: PlayerRoom = {
      userId: dto.userId,
      // pas de vrai socket ici, on génère un id bidon pour respecter l'interface
      socketId: `http-temp-${randomUUID()}`,
      color: dto.color,
      invit: dto.invit,
    };

    const result = dto.invit
      ? await this.gameRoomService.invitPlayerEnty(player)
      : await this.gameRoomService.newPlayerEntry(player);

    // newPlayerEntry / invitPlayerEnty renvoient soit :
    // - un roomId (string) -> en attente d'un adversaire
    // - une GameState -> la partie a démarré
    if (typeof result === 'string') {
      return { status: 'waiting', roomId: result };
    }

    return { status: 'ready', game: result };
  }
}
