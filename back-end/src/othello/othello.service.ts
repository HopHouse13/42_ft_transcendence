/*
import { Injectable } from '@nestjs/common';

@Injectable()
export class OthelloService {
  // TODO: gestion des parties en cours (in-memory ou via DB)
  // TODO: brancher le moteur de jeu (dossier engine/)

  ping() {
    return { module: 'othello', status: 'ready' };
  }
}
*/

/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { OthelloEngine } from './engine/othello-engine';
import type { Player } from './engine/othello-engine';
import type { Move as EngineMove } from './engine/othello-engine';
import type { GameResult as EngineGameResult } from './engine/othello-engine';
import type { Cell as EngineCell } from './engine/othello-board';

import { GameStatus } from './enums/game-status.enum';
import type { GameState, PlayerInfo } from './interfaces/game-state.interface';
import type { MoveResult, Move, GameResult } from './interfaces/move-result.interface';

/* ========================================================================== */

interface GameEntry {

  engine: OthelloEngine;
  players: PlayerInfo[];
  status: GameStatus;
  createdAt: Date;
}

/* ========================================================================== */

@Injectable()
export class OthelloService {

  private readonly games = new Map<string, GameEntry>();

  createGame(hostUserId: string): GameState {
  
    const gameId = randomUUID();
    const engine = new OthelloEngine();

    const entry: GameEntry = {
    
      engine,
      players: [{ userId: hostUserId, color: 'BLACK', connected: true }],
      status: GameStatus.WAITING,
      createdAt: new Date(),
    };

    this.games.set(gameId, entry);

    return( this.buildGameState(gameId, entry) );
  }

  joinGame(gameId: string, userId: string): GameState {

    const entry = this.getEntry(gameId);

    if (entry.players.length >= 2) {
    
      throw new Error(`La partie ${gameId} est déjà complète`);
    }

    entry.players.push({ userId, color: 'WHITE', connected: true });
    entry.status = GameStatus.IN_PROGRESS;

    return( this.buildGameState(gameId, entry) );
  }

  playMove(gameId: string, userId: string, move: Move): MoveResult {
    
    const entry = this.getEntry(gameId);
    const playerInfo = entry.players.find((p) => p.userId === userId);

    if (!playerInfo) {
      
      return( { valid: false, reason: `Joueur ${userId} ne fait pas partie de cette partie` } );
    }

    const engineMove: EngineMove = { row: move.row, col: move.col };

    if (!entry.engine.isValidMove(engineMove, playerInfo.color)) {
      
      return( { valid: false, reason: `Coup invalide: (${move.row}, ${move.col})` } );
    }

    try {
      
      entry.engine.playMove(engineMove, playerInfo.color);
    
    } catch (err) {
    
      return( { valid: false, reason: (err as Error).message } );
    }

    const gameOver = entry.engine.isGameOver();
    entry.status = (gameOver)? GameStatus.FINISHED : GameStatus.IN_PROGRESS;

    const result: MoveResult = {

      valid: true,
      board: this.serializeBoard(entry.engine),
      nextPlayer: entry.engine.getCurrentPlayer(),
      status: entry.status,
    };

    if (gameOver) {

      result.result = this.toGameResult(entry.engine.returnResult());
    }

    return( result );
  }

  getState(gameId: string): GameState {

    const entry = this.getEntry(gameId);
    return( this.buildGameState(gameId, entry) );
  }

  markDisconnected(gameId: string, userId: string): void {

    const entry = this.games.get(gameId);
    if (!entry) return;

    const player = entry.players.find((p) => p.userId === userId);
    if (player) player.connected = false;
  }

//  
  private getEntry(gameId: string): GameEntry {

    const entry = this.games.get(gameId);
    if (!entry) throw new NotFoundException(`Partie ${gameId} introuvable`);
    
    return( entry );
  }

  private buildGameState(gameId: string, entry: GameEntry): GameState {

    const currentPlayer = entry.engine.getCurrentPlayer();

    return {
      gameId,
      cells: this.serializeBoard(entry.engine),
      status: entry.status,
      players: entry.players,
      currentPlayer,
      validMoves: entry.engine.allValidMove(currentPlayer),
      result: entry.status === GameStatus.FINISHED
        ? this.toGameResult(entry.engine.returnResult())
        : undefined,
      createdAt: entry.createdAt,
    };
  }

  private serializeBoard(engine: OthelloEngine): EngineCell[] {

    const board = engine.getBoard();
    const cells: EngineCell[] = [];

    for (let row = 0; row < 8; row++) {
    
      for (let col = 0; col < 8; col++) {
      
        cells.push(board.getCell(row, col));
      }
    }

    return( cells );
  }

  private toGameResult(r: EngineGameResult): GameResult {

    return( { winner: r.winner, blackCount: r.blackCount, whiteCount: r.whiteCount } );
  }
}
