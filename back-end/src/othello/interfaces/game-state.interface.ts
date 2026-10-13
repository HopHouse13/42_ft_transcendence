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

  mode:           'LOCAL' | 'BOT' | 'ONLINE';  
  status:         'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  
  players:        PlayerInfo[];
  currentPlayer:  PlayerColor;
  validMoves:     Move[];
  result?:        GameResult;
  createdAt:      Date;

}