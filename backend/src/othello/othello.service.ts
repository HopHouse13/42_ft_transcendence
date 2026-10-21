/* eslint-disable */

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

import { GameStatus } from './enums/game-status.enum';
import type { GameState } from './interfaces/game-state.interface';
import type { PlayerInfo } from './interfaces/player-info.interface';
import type { MoveResult } from './interfaces/move-result.interface';
import type { GameResult } from './interfaces/game-result.interface';

import { ComputePlayerService } from '../compute-player/compute-player.service';
import { GameRoomService, GameRoom } from '../game-room/game-room.service';
import { AchievementService } from '../achievement/achievement.service';
import { SpectatorGateway } from '../spectator/spectator.gateway';
import { EloService } from '../elo/elo.service';
import { Prisma } from '@prisma/client';         // 👈 Indispensable pour le type de transaction

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

    constructor(

        private readonly computePlayerService: ComputePlayerService,
        private readonly prisma: PrismaService,
        private readonly gameRoom: GameRoomService,
        private readonly achievement: AchievementService,
        private readonly spectatorGateway: SpectatorGateway,
        private readonly elo: EloService,
    ){}

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
    /*  - ComputeCreateGame: fonc for set a var GameService                       */
    /*  - ComputePlayMove: fonc for Update state interface                        */
    /*  - computePlayTurn: fonc for use a computePlayer obj                       */
    /*  - ComputelineGiveUp: fonc for clean ending                                */
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
    // async computePlayMove(gameId: string, move: Move, userId: string): Promise<GameState> {
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
    // async computePlayTurn(gameId: string): Promise<GameState> {
    async botPlayTurn(gameId: string): Promise<GameState> {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return this.getGameState(gameId);
        }

        const botPlayer = service.state.players.find(p => p.userId !== service.state.players[0].userId);
        if (!botPlayer) return this.getGameState(gameId);

        const botColor = botPlayer.color;

        // Boucle pour gérer le cas où le bot doit jouer, ou rejouer si l'humain a dû passer son tour,
        // ou si le bot lui-même s'enchaîne plusieurs tours.
        while (
            service.state.status === GameStatus.IN_PROGRESS &&
            service.engine.getCurrentPlayer() === botColor &&
            !service.engine.isGameOver()
        ) {
            const legalMoves = service.engine.allValidMove(botColor);

            if (legalMoves.length === 0) {
                // Le bot n'a aucun coup valide : l'engine gère ou force le passage de tour
                // (ou on break pour éviter une boucle infinie si personne n'a de coup)
                break;
            }

            const botMove = await this.computePlayerService.requestMove(
                service.engine.getBoard().getAllCell(),
                botColor,
                legalMoves
            );

            if (botMove) {
                service.engine.playMove(botMove, botColor);
                service.state.board = service.engine.getBoard().getAllCell();
            } else {
                break;
            }
        }

        // Mettre à jour l'état final après le ou les coups du bot
        const nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        if (service.engine.isGameOver()) {
            service.state.status = GameStatus.FINISHED;
        }

        return this.getGameState(gameId);
    }

    // botGiveUp(gameId: string): GameState {
    botGiveUp(gameId: string): GameState {
        const service: GameService = this.getLocalGame(gameId);

        if (service.state.status === GameStatus.FINISHED) {
            return service.state;
        }

        service.state.status = GameStatus.FINISHED;
        return this.getGameState(gameId);
    }

    /* -------------------------------------------------------------------------- */
    /*                         ~~ Methode Online Player: ~~                       */
    /*                                                                            */
    /*  - OnlineCreateGame: fonc for set a var GameService                        */
    /*  - OnlinePlayMove: fonc for Update state interface                         */
    /*  - OnlineGiveUp: fonc for clean ending                                     */
    /* -------------------------------------------------------------------------- */

    async OnlineCreateGame(hostPlayer: { userId: string; socketId: string; color?: 'BLACK' | 'WHITE' }): Promise<{ gameId: string; roomStatus: 'waiting' | 'ready'; roomId?: string }> {

        const room: GameRoom = this.gameRoom.newPlayerEntry(hostPlayer);
        if (room.status === 'waiting') {

            return( {gameId: '', roomStatus: 'waiting', roomId: room.roomId} );
        }

        const setGameId = randomUUID();
        const setEngine = new OthelloEngine();

        const p1Color: Player = (room.player1.color as Player) || 'BLACK';
        const p2Color: Player = (room.player2?.color as Player) || (p1Color === 'BLACK' ? 'WHITE' : 'BLACK');

        const playerArr: PlayerInfo[] = [
            { userId: room.player1.userId, color: p1Color, connected: true },
            { userId: room.player2!.userId, color: p2Color, connected: true }
        ];

        const service: GameService = {gameId: setGameId, engine: setEngine, state: {
                gameId: setGameId,
                mode: 'ONLINE',
                status: 'IN_PROGRESS',
                board: setEngine.getBoard().getAllCell(),
                players: playerArr,
                currentPlayer: 'BLACK',
                validMoves: setEngine.allValidMove('BLACK'),
                createdAt: new Date()
            }
        }; this.games.set(service.gameId, service);

        try {

            await this._dbCreateGame(setGameId, playerArr);

            // Trigger: a new game has started to watch page
            this.spectatorGateway.broadcastGameUpdate(setGameId);

        } catch (dbError) {

            console.error("Fatal Error :", dbError);
        }

        return( {gameId: setGameId, roomStatus: 'ready', roomId: room.roomId} );
    }

    async onlinePlayMove(gameId: string, move: Move, userId: string): Promise<GameState> {

        const service: GameService = this.getLocalGame(gameId);
        if (service.state.status === GameStatus.FINISHED) {
            throw new Error("Cette partie est déjà terminée.");
        }

        const currentColor = service.engine.getCurrentPlayer();
        const player = service.state.players.find(p => p.color === currentColor);
        if (!player || player.userId !== userId) {
            throw new Error(`Ce n'est pas votre tour de jouer.`);
        }

        // Appel de la méthode privée pour compter les coups
        const existingMovesCount = await this._dbGetExistingMovesCount(gameId);
        const currentMoveNumber = existingMovesCount + 1;

        service.engine.playMove(move, player.color);
        const newBoardCells = service.engine.getBoard().getAllCell();
        service.state.board = newBoardCells;

        const nextTurnPlayer = service.engine.getCurrentPlayer();
        service.state.currentPlayer = nextTurnPlayer;
        service.state.validMoves = service.engine.allValidMove(nextTurnPlayer);

        const isOver = service.engine.isGameOver();
        if (isOver) {
            service.state.status = GameStatus.FINISHED;
        }

        const boardAfterString = newBoardCells.map(cell => (cell === 'BLACK' ? 'B' : cell === 'WHITE' ? 'W' : '-')).join('').padEnd(64, '-');

        const positionIndex = move.row * 8 + move.col;
        const blackScore = newBoardCells.filter(c => c === 'BLACK').length;
        const whiteScore = newBoardCells.filter(c => c === 'WHITE').length;

        let winnerId: string | null = null;
        if (isOver) {
            if (blackScore > whiteScore) {
                winnerId = service.state.players.find(p => p.color === 'BLACK')?.userId || null;
            } else if (whiteScore > blackScore) {
                winnerId = service.state.players.find(p => p.color === 'WHITE')?.userId || null;
            }
        }

        // Appel de la méthode privée pour sauvegarder le coup et l'état en transaction (avec l'Elo)
        try {
            await this._dbSaveMoveAndGameState(
                gameId,
                currentMoveNumber,
                player.color,
                positionIndex,
                blackScore,
                whiteScore,
                boardAfterString,
                isOver,
                nextTurnPlayer,
                winnerId
            );

            // trigger broadcast to watch page
            if (typeof this.spectatorGateway?.broadcastGameUpdate === 'function') {
                this.spectatorGateway.broadcastGameUpdate(gameId);
            }

            console.log(` Move n°${currentMoveNumber} success game save ${gameId}`);
            
            if (isOver) {
                const aaa = await this.achievement.validateAchievement(gameId);
                console.log(`test achiv ${aaa} `);
            }

        } catch (dbError) {
            console.error(" Fatal Error: ", dbError);
            throw dbError; // On relance l'erreur pour ne pas désynchroniser l'état mémoire et DB
        }

        return( this.getGameState(gameId) );
    }

    async onlineGiveUp(gameId: string, userId: string): Promise<GameState> {

        const service: GameService = this.getLocalGame(gameId);
        if ( service.state.status === GameStatus.FINISHED ) {

            return( service.state );
        }

        const player = service.state.players.find(p => p.userId === userId);
        if ( !player )  {

            throw new Error("Vous ne faites pas partie de cette partie.");
        }

        service.state.status = GameStatus.FINISHED;

        const boardCells = service.engine.getBoard().getAllCell();
        const blackScore = boardCells.filter(c => c === 'BLACK').length;
        const whiteScore = boardCells.filter(c => c === 'WHITE').length;

        const opponentPlayer = service.state.players.find(p => p.userId !== userId);
        const winnerId = opponentPlayer ? opponentPlayer.userId : null;

        try {
            await this._dbFinishGameByGiveUp(gameId, blackScore, whiteScore, winnerId);

            console.log(`Game ${gameId} give up by ${userId}. Winner is : ${winnerId}`);

            // trigger forfeit to watch
            this.spectatorGateway.broadcastGameUpdate(gameId);

        } catch (dbError) {

            console.error("Fatal Error: ", dbError);
        }

        return( this.getGameState(gameId) );
    }

    OnlineRemovePlayerFromQueue(userId: string): void {

        this.gameRoom.removeWaitingRoomByUserId(userId);

    }

    /* -------------------------------------------------------------------------- */
    /*  Mode Online (Matchmaking & PvP réseau)                                    */
    /* -------------------------------------------------------------------------- */

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
    /* ------------------ | Methode Private: for DataBase | --------------------- */
    /* -------------------------------------------------------------------------- */


    private async _dbCreateGame(setGameId: string, playerArr: PlayerInfo[]): Promise<void> {
        const blackPlayer = playerArr.find(p => p.color === 'BLACK');
        const whitePlayer = playerArr.find(p => p.color === 'WHITE');

        await this.prisma.game.create({
            data: {
                id: setGameId,
                status: 'IN_PROGRESS',
                blackPlayerId: blackPlayer ? blackPlayer.userId : playerArr[0].userId,
                whitePlayerId: whitePlayer ? whitePlayer.userId : playerArr[1].userId
            }
        });
    }

    private async _dbGetExistingMovesCount(gameId: string): Promise<number> {
        return await this.prisma.move.count({
            where: { gameId: gameId }
        });
    }

    private async finishOnlineGame(
        tx: Prisma.TransactionClient,
        gameId: string,
        data: { blackScore: number; whiteScore: number; winnerId: string | null; nextPlayer?: Player }
    ): Promise<void> {
        // Verrou d'idempotence : s'assure qu'on ne traite pas la fin de partie deux fois
        const res = await tx.game.updateMany({
            where: { id: gameId, status: { not: 'FINISHED' } },
            data: { status: 'FINISHED', ...data },
        });
        
        if (res.count === 0) return; // Déjà terminée

        // Récupération de la partie pour appliquer l'Elo aux utilisateurs
        const game = await tx.game.findUniqueOrThrow({ where: { id: gameId } });
        await this.elo.applyGameResult(tx, game);
    }

    private async _dbSaveMoveAndGameState(
        gameId: string,
        currentMoveNumber: number,
        playerColor: Player,
        positionIndex: number,
        blackScore: number,
        whiteScore: number,
        boardAfterString: string,
        isOver: boolean,
        nextTurnPlayer: Player,
        winnerId: string | null): Promise<void> {
        
        await this.prisma.$transaction(async (tx) => {
            await tx.move.create({
                data: {
                    gameId: gameId,
                    moveNumber: currentMoveNumber,
                    Color: playerColor as any,
                    position: positionIndex,
                    blackScore,
                    whiteScore,
                    boardAfter: boardAfterString,
                }
            });

            if (isOver) {
                await this.finishOnlineGame(tx, gameId, {
                    blackScore,
                    whiteScore,
                    winnerId,
                    nextPlayer: nextTurnPlayer as any,
                });
            } else {
                await tx.game.update({
                    where: { id: gameId },
                    data: { nextPlayer: nextTurnPlayer as any }
                });
            }
        });
    }
    
    private async _dbFinishGameByGiveUp(
        gameId: string,
        blackScore: number,
        whiteScore: number,
        winnerId: string | null): Promise<void> {

        await this.prisma.$transaction(async (tx) => {
            await this.finishOnlineGame(tx, gameId, {
                blackScore,
                whiteScore,
                winnerId,
            });
        });
    }
    /* -------------------------------------------------------------------------- */


}
