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
    /*                          ~~ Methode Local: ~~                              */
    /*                                                                            */
    /*  - localCreateGame: fonc for set a var GameService                         */
    /*  - LocalPlayMove: fonc for Update state interface                          */
    /*  - LocalGiveUp: fonc for clean ending                                      */
    /* -------------------------------------------------------------------------- */

    localCreateGame(hostUserId: string): string {

        const setGameId = randomUUID(); const setEngine = new OthelloEngine();
        
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

    // 1. Récupérer la couleur du joueur dont c'est le tour directement via l'engine
    // 2. Trouver le PlayerInfo correspondant dans l'état du jeu
    // 3. Jouer le coup
    // 4. Mettre à jour l'état du jeu (en utilisant getAllCell() comme dans createGame)
    localPlayMove(gameId: string, move: Move): GameState {
        
        const service: GameService = this.getLocalGame(gameId);
        const currentColor = service.engine.getCurrentPlayer();


        const player = service.state.players.find(p => p.color === currentColor);
        if (!player) {

            throw new Error(`Aucun joueur trouvé pour la couleur ${currentColor}`);
        }

        service.engine.playMove(move, player.color);
        service.state.board = service.engine.getBoard().getAllCell();
        
        const nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        if ( service.engine.isGameOver() )  {
            
            service.state.status = GameStatus.FINISHED;
        }

        return( this.getGameState(gameId) );
    }
    
    // Marquer la partie comme terminée
    // Optionnel : Vous pouvez stocker le gagnant ou l'info d'abandon dans le state si besoin,
    // par exemple le joueur adverse gagne par forfait.
    localGiveUp(gameId: string, playerColor: Player): GameState {
        
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED)   {
            
            return( service.state );
        }

        service.state.status = GameStatus.FINISHED;

        return( this.getGameState(gameId) );
    }

    /* -------------------------------------------------------------------------- */
    /*                     ~~ Methode Compute Player: ~~                          */
    /*                                                                            */
    /* -------------------------------------------------------------------------- */

    computeCreateGame(hostUserId: string, userColor: 'BLACK' | 'WHITE' = 'BLACK'): string {

        const setGameId = randomUUID(); 
        const setEngine = new OthelloEngine();
        
        // Détermine la couleur du bot (l'opposé de celle du joueur)
        const botColor = userColor === 'BLACK' ? 'WHITE' : 'BLACK';

        const playerArr: PlayerInfo[] = [
            { userId: hostUserId, color: userColor, connected: true },
            { userId: randomUUID(), color: botColor, connected: true }
        ];
        
        const service: GameService = { 
            gameId: setGameId, 
            engine: setEngine, 
            state: {
                gameId: setGameId,
                mode: 'BOT', 
                status: 'IN_PROGRESS',
                board: setEngine.getBoard().getAllCell(),
                players: playerArr,
                currentPlayer: 'BLACK', // Les Noirs commencent toujours à Othello
                validMoves: setEngine.allValidMove('BLACK'),
                createdAt: new Date 
            }
        }; 
        
        this.games.set(service.gameId, service);
        
        return service.gameId;
    }

    // 1. Exécute uniquement le coup de l'humain
    async humanPlayMove(gameId: string, move: Move, userId: string): Promise<GameState> {
        const service: GameService = this.getLocalGame(gameId);

        const currentColor = service.engine.getCurrentPlayer();
        const player = service.state.players.find(p => p.color === currentColor);
        
        if (!player || player.userId !== userId) {
            throw new Error(`Ce n'est pas votre tour de jouer.`);
        }

        // Jouer le coup de l'humain
        service.engine.playMove(move, player.color);
        service.state.board = service.engine.getBoard().getAllCell();

        let nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        if (service.engine.isGameOver()) {
            service.state.status = GameStatus.FINISHED;
        }

        return this.getGameState(gameId);
    }

    // 2. Exécute le tour du bot ensuite
    async botPlayTurn(gameId: string): Promise<GameState> {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return this.getGameState(gameId);
        }

        // Identifier le bot (le joueur qui n'est pas l'humain, ou selon ta logique de couleur)
        const botPlayer = service.state.players.find(p => p.userId !== service.state.players[0].userId); 
        
        if (botPlayer && service.engine.getCurrentPlayer() === botPlayer.color && !service.engine.isGameOver()) {
            const botColor = botPlayer.color;
            const legalMoves = service.engine.allValidMove(botColor);

            if (legalMoves.length > 0) {
                const botMove = await this.computePlayerService.requestMove(
                    service.engine.getBoard().getAllCell(),
                    botColor, 
                    legalMoves
                );

                if (botMove) {
                    service.engine.playMove(botMove, botColor);
                    service.engine.getBoard().getAllCell();
                }
            }

            // Mettre à jour l'état après le coup du bot
            const nextTurnPlayer = service.engine.getCurrentPlayer();
            service.state.currentPlayer = nextTurnPlayer;
            service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

            if (service.engine.isGameOver()) {
                service.state.status = GameStatus.FINISHED;
            }
        }

        return this.getGameState(gameId);
    }

    botGiveUp(gameId: string): GameState {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return service.state;
        }

        service.state.status = GameStatus.FINISHED;
        return this.getGameState(gameId);
    }

    /* -------------------------------------------------------------------------- */

    // Crée une partie Bot vs Bot pour le mode Stream
    createBotVsBotGame(): string {
        const setGameId = randomUUID(); 
        const setEngine = new OthelloEngine();
        
        const playerArr: PlayerInfo[] = [
            { userId: 'bot-black-id', color: 'BLACK', connected: true },
            { userId: 'bot-white-id', color: 'WHITE', connected: true }
        ];
        
        const service: GameService = { 
            gameId: setGameId, 
            engine: setEngine, 
            state: {
                gameId: setGameId,
                mode: 'BOT', 
                status: 'IN_PROGRESS',
                board: setEngine.getBoard().getAllCell(),
                players: playerArr,
                currentPlayer: 'BLACK',
                validMoves: setEngine.allValidMove('BLACK'),
                createdAt: new Date 
            }
        }; 
        
        this.games.set(service.gameId, service);
        return service.gameId;
    }

    async botVsBotPlayTurn(gameId: string): Promise<GameState> {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return this.getGameState(gameId);
        }

        const currentColor = service.engine.getCurrentPlayer();
        const legalMoves = service.engine.allValidMove(currentColor);

        if (legalMoves.length > 0) {
            // Demande au service de calcul de trouver le meilleur coup pour la couleur actuelle
            const botMove = await this.computePlayerService.requestMove(
                service.engine.getBoard().getAllCell(),
                currentColor, 
                legalMoves
            );

            if (botMove) {
                service.engine.playMove(botMove, currentColor);
                service.engine.getBoard().getAllCell();
            }
        }

        // Mettre à jour l'état après le coup du bot
        const nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        if (service.engine.isGameOver()) {
            service.state.status = GameStatus.FINISHED;
        }

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
