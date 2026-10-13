/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { Game } from '@prisma/client';

import { OthelloEngine } from './engine/othello-engine';

import type { Player } from './types/player.type';
import type { Move, Move as EngineMove } from './types/move.type';
import type { GameResult as EngineGameResult } from './interfaces/game-result.interface';
import type { Cell as EngineCell } from './types/cell.type';
//import type { Cell as EngineCell } from './engine/othello-board';

import { GameStatus } from './enums/game-status.enum';
import type { GameState } from './interfaces/game-state.interface';
import type { PlayerInfo } from './interfaces/player-info.interface';
import type { MoveResult } from './interfaces/move-result.interface';
import type { GameResult } from './interfaces/game-result.interface';

import { ComputePlayerService } from '../compute-player/compute-player.service';

/* -------------------------------------------------------------------------- */

interface GameService {

    gameId: string;
    engine: OthelloEngine;
    state:  GameState; 
}
/* -------------------------------------------------------------------------- */

@Injectable()
export class    OthelloService  {

    private readonly games = new Map<string, GameService>();
    
    constructor( private readonly computePlayerService: ComputePlayerService, private readonly prisma: PrismaService) {}

    /* -------------------------------------------------------------------------- */

    createLocalGame(hostUserId: string): string {

        const setEngine = new OthelloEngine();
        const playerArr: PlayerInfo[] = [
            { userId: hostUserId, color: 'BLACK', connected: true },
            {userId: randomUUID(), color: 'WHITE', connected: true}];
        
        const service: GameService = { gameId: randomUUID(), engine: setEngine, state  : {

                mode: 'LOCAL', 
                status: 'IN_PROGRESS',
                players: playerArr,
                currentPlayer: 'BLACK',
                validMoves: setEngine.allValidMove('BLACK'),
                createdAt:  new Date 
            }} 
        
        this.games.set(service.gameId, service);
        return( service.gameId );
    }

    playMove(gameId: string, player: PlayerInfo, move: Move)    {

        const service: GameService = this.getLocalGame(gameId);
        service.engine.playMove(move, player.color);

        return( this.getGameState(gameId) );
    }

    /* -------------------------------------------------------------------------- */

    getGameState(gameId: string):   GameState {

        return( this.getLocalGame(gameId).state );
    }

    getLocalGame(gameId: string)    {

       const game = this.games.get(gameId);
        if( !game )     {

            throw new Error(`Game with id ${gameId} not found`);
        }
        return( game );
    }
    
    deleteGame(gameId: string) {

        this.games.delete(gameId);
        console.log(`the game: ${gameId} is deleted`);

    }

    /* -------------------------------------------------------------------------- */
    /*                                                                            */
    /* -------------------------------------------------------------------------- */


    /* -------------------------------------------------------------------------- */

   
}
