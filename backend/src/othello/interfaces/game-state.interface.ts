/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Cell } from '../types/cell.type';
import { Move } from '../types/move.type';
import { Player as PlayerColor } from '../types/player.type';

import { GameStatus } from '../enums/game-status.enum';
import { GameResult } from './game-result.interface';
import { PlayerInfo } from './player-info.interface';


/* ========================================================================== */

export interface GameState {

  gameId:          string, 
  mode:           'LOCAL' | 'BOT' | 'ONLINE';  
  status:         'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  
  board:          Cell[], 
  players:        PlayerInfo[];
  validMoves:     Move[];
  currentPlayer:  PlayerColor;
  result?:        GameResult;
  createdAt:      Date;

}