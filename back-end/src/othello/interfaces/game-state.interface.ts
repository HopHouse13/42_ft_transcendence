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

  gameId:         string;
  cells:          Cell[];                 // snapshot du plateau (64 cases), pas l'instance OthelloBoard
  status:         GameStatus;
  players:        PlayerInfo[];
  currentPlayer:  PlayerColor;
  validMoves:     Move[];
  result?:        GameResult;
  createdAt:      Date;
}
