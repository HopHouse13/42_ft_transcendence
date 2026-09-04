/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

//import { PrismaService } from '../database/prisma.service';
import { OthelloEngine } from './engine/othello-engine';

import type { Player } from './interfaces/engine.interface';
import type { Move as EngineMove } from './interfaces/engine.interface';
import type { GameResult as EngineGameResult } from './interfaces/engine.interface';
import type { Cell as EngineCell } from './interfaces/engine.interface';
//import type { Cell as EngineCell } from './engine/othello-board';

import { GameStatus } from './enums/game-status.enum';
import type { GameState, PlayerInfo } from './interfaces/game-state.interface';
import type { MoveResult, Move, GameResult } from './interfaces/move-result.interface';

/* ========================================================================== */

/**
 * Represente une partie
 * engine -> une instace de la class OthelloEngine
 * player -> interface PlayerInfo [ userId, color, connected
 * status -> enum GameStatus Waiting || in_progress || finshed
 * createdAt -> date de la creatation de la partie
 */
interface GameEntry {

    engine:     OthelloEngine;
    players:    PlayerInfo[];
    status:     GameStatus;
    createdAt:  Date;
}

/* ========================================================================== */

@Injectable()
export class    OthelloService {

/**
 * map qui utilise gameID comme clée et lie a l'interface GameEntry
 */
    private readonly games = new Map<string, GameEntry>();
    
/**
 * Fonction createGame and joinGame
 * createGame init interface GameEntry and add in map games ( a first players is a BLACK and hostPlayers )
 * joinGame add a new player for a game ( all time a sceond player is a 'WHITE' )
 */

    createGame(hostUserId: string): GameState {
  
        const gameId = randomUUID(); const gameEntry = this._initGameEntry(hostUserId);
        this.games.set( gameId, gameEntry );

        //await this.prisma.game.create({ data: { id: gameId, status: 'WAITING', playerBlack: hostUserId} });
        
        return( this.buildGameState(gameId, gameEntry) );
    }


  joinGame(gameId: string, userId: string): GameState {

    const gameEntry = this._getGameEntry(gameId);
    if (gameEntry.players.length >= 2)  {
    
      throw new BadRequestException(`La partie ${gameId} est déjà complète`);
    }

    gameEntry.players.push( { userId, color: 'WHITE', connected: true } );
    gameEntry.status = GameStatus.IN_PROGRESS;

      //await this.prisma.game.update({ where: { id: gameId }, data: { playerWhite: userId, status: 'IN_PROGRESS' } });
      
    return( this.buildGameState(gameId, gameEntry) );
  }
    
/**
 *
 *
 */
    
    playMove(gameId: string, userId: string, move: Move): MoveResult {
    
        const entry = this._getGameEntry(gameId);
        const engineMove: EngineMove = { row: move.row, col: move.col };
    
        const playerInfo = entry.players.find((p) => p.userId === userId);
        if (!playerInfo) {
      
            throw new BadRequestException( `Joueur ${userId} ne fait pas partie de cette partie` );
        }
        
        try {
      
            entry.engine.playMove(engineMove, playerInfo.color);
    
        } catch (err) {
    
            throw new BadRequestException(`Coup invalide en (${move.row}, ${move.col})`);
        }
        
        //await this.prisma.move.create({ data: { gameId, player: playerInfo.color, row: move.row, col: move.col} });
    
        const result = this._setMoveResult(entry);
    
        const gameOver = entry.engine.isGameOver();
        if (gameOver) {

            result.result = this.toGameResult(entry.engine.returnResult());
            //await this.prisma.game.update({ where: { id: gameId }, data: { status: 'FINISHED', winner: (engineResult.winner === 'BLACK' || engineResult.winner === 'WHITE') ? engineResult.winner : null, blackCount: engineResult.blackCount, whiteCount: engineResult.whiteCount } });
        }
        entry.status = (gameOver)? GameStatus.FINISHED : GameStatus.IN_PROGRESS;

        return( result );
  }
    
/**
 * Methode getState
 * retourne l interface GameState qui corespons a l'id de la partie ( gameId )
 */
    getState(gameId: string): GameState   {
        
        const gameEntry = this._getGameEntry(gameId); // const gameEntry = await this._getOrRestoreGameEntry(gameId);
        
        return( this.buildGameState(gameId, gameEntry) );
    }
    
/**
 * Methode marckDisconnected: change la valeur de player.conected en false
 *  si il ne trouve pas d interface GameEntry corespondant a gameID s'arrete
 *  si il trouve dans playerInfo un userID change la valeur de connected en false
 */
    markDisconnected(gameId: string, userId: string):   void    {

        const gameEntry = this.games.get(gameId);
        if (!gameEntry)
          return;

        const player = gameEntry.players.find((p) => p.userId === userId);
        if ( player )
            player.connected = false;
    }

// ~~ private Method: _initGameEntry | _getGameEntry | buildGameState | serializeBoard | toGameResult ~~ //

/*
    private async _getOrRestoreGameEntry(gameId: string): Promise<GameEntry>    {

            const cached = this.games.get(gameId);
            if (cached) {
         
                return( cached );
            }
        
            const dbGame = await this.prisma.game.findUnique({ where: { id: gameId }, include: { moves: { orderBy: { createdAt: 'asc' }}} });

            if (!dbGame) {
                
                throw new NotFoundException(`Partie ${gameId} introuvable`);
            }

            const engine = new OthelloEngine();
            for (const m of dbGame.moves) {
                
                engine.playMove({ row: m.row, col: m.col }, m.player as Player);
            }

            const players: PlayerInfo[] = [ { userId: dbGame.playerBlack, color: 'BLACK', connected: false } ];
            
            if (dbGame.playerWhite) {
            
                players.push({ userId: dbGame.playerWhite, color: 'WHITE', connected: false });
            }

            const restored: GameEntry = {
            
            engine,
            players,
            status: dbGame.status as GameStatus,
            createdAt: dbGame.createdAt,
            
            };

            this.games.set(gameId, restored);
            
            return( restored) ;
        }
 */
    
/**
 * Private Methode _initGameEntry and _getGameEntry for use a interface GameEntry
 *
 * _initGameEntry -> set a new engine, first player(host player) in black, set Status and set a Date
 * _getGameEntry  -> return all interface or up Exeption if bad gameId or GameEntry no existe
 */
    private _initGameEntry( hostUserId: string ): GameEntry   {
        
        const newEntry: GameEntry = {
          
            engine:      new OthelloEngine(),
            players:     [{ userId: hostUserId, color: 'BLACK', connected: true }],
            status:      GameStatus.WAITING,
            createdAt:   new Date(),
        };

        return( newEntry );
    }
    
    private _getGameEntry(gameId: string): GameEntry {

        const gameEntry = this.games.get(gameId);
        if (!gameEntry) {
            
            throw new NotFoundException(`Partie ${gameId} introuvable`);
        }
    
        return( gameEntry );
    }

    private _setMoveResult(gameEntry: GameEntry):  MoveResult {
        
        const moveResult: MoveResult = {

            valid: true,
            board: this.serializeBoard(gameEntry.engine),
            nextPlayer: gameEntry.engine.getCurrentPlayer(),
            status: gameEntry.status,
        };
        
        return( moveResult );
    }
//                   ~~ ~~                     //
/**
 * Private Methode buildGameState: retourne un interface GameState construite a partir de games( Map<gameId, GameEntry> )
 *
 */
    private buildGameState(gameId: string, gameEntry: GameEntry): GameState   {
        
        const currentPlayer = gameEntry.engine.getCurrentPlayer();
        
        return {
    
            gameId,
            cells: this.serializeBoard(gameEntry.engine),
            status: gameEntry.status,
            players: gameEntry.players,
            currentPlayer,
            validMoves: gameEntry.engine.allValidMove(currentPlayer),
            result: ( gameEntry.status === GameStatus.FINISHED )? this.toGameResult(gameEntry.engine.returnResult()) : undefined,
            createdAt: gameEntry.createdAt,
        };
        
    }
/**
 * Private Methode serializeBoard: fait une copy du plateaux du moteur de jeux dans un tableaux unidirectionel EngineCell[]
 *
 */
  private serializeBoard(engine: OthelloEngine): EngineCell[] {

    const board = engine.getBoard();  const cells: EngineCell[] = [];
    for (let row = 0; row < 8; row++)
    {
      for (let col = 0; col < 8; col++) {
      
        cells.push(board.getCell(row, col));
      }
    }
      
    return( cells );
  }

/**
 * Private Methode toGameResult: retourne une interface GameResult
 */
  private toGameResult(r: EngineGameResult): GameResult {

    return( { winner: r.winner, blackCount: r.blackCount, whiteCount: r.whiteCount } );
  }

}
