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

    localCreateGame(hostUserId: string): string {

        const setGameId = randomUUID();
        const setEngine = new OthelloEngine();
        const playerArr: PlayerInfo[] = [
            { userId: hostUserId, color: 'BLACK', connected: true },
            {userId: randomUUID(), color: 'WHITE', connected: true}];
        
        const service: GameService = { gameId: setGameId, engine: setEngine, state  : {

                gameId: setGameId,
                mode: 'LOCAL', 
                status: 'IN_PROGRESS',
                board: setEngine.getBoard().getAllCell(),
                players: playerArr,
                currentPlayer: 'BLACK',
                validMoves: setEngine.allValidMove('BLACK'),
                createdAt:  new Date 
            }} 
        
        this.games.set(service.gameId, service);
        return( service.gameId );
    }

    localPlayMove(gameId: string, move: Move) {
        
        const service: GameService = this.getLocalGame(gameId);
        
        // 1. Récupérer la couleur du joueur dont c'est le tour directement via l'engine
        const currentColor = service.engine.getCurrentPlayer();

        // 2. Trouver le PlayerInfo correspondant dans l'état du jeu
        const player = service.state.players.find(p => p.color === currentColor);
        if (!player) {
            throw new Error(`Aucun joueur trouvé pour la couleur ${currentColor}`);
        }

        // 3. Jouer le coup
        service.engine.playMove(move, player.color);

        // 4. Mettre à jour l'état du jeu (en utilisant getAllCell() comme dans createGame)
        service.state.board = service.engine.getBoard().getAllCell();
        
        const nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        if (service.engine.isGameOver()) {
            service.state.status = GameStatus.FINISHED;
        }

        return this.getGameState(gameId);
    }

    localGiveUp(gameId: string, playerColor: Player) {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return service.state;
        }

        // Marquer la partie comme terminée
        service.state.status = GameStatus.FINISHED;

        // Optionnel : Vous pouvez stocker le gagnant ou l'info d'abandon dans le state si besoin,
        // par exemple le joueur adverse gagne par forfait.
        
        return this.getGameState(gameId);
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
