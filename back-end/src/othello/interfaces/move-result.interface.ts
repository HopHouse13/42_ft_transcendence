/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Cell } from '../types/cell.type';
import { Move } from '../types/move.type'
import { Player as PlayerColor } from '../types/player.type';

import { GameStatus } from '../enums/game-status.enum';

import type { GameResult } from './game-result.interface';


/* ========================================================================== */

export interface MoveResult {

  valid:          boolean;              // le coup était-il légal ?
  board?:         Cell[];               // plateau (64 cases) après le coup, si valide
  flippedCells?:  Move[];               // pions retournés, pour l'animation côté front
  nextPlayer?:    PlayerColor;          // qui doit jouer ensuite
  status?:        GameStatus;           // partie en cours ou terminée ?
  result?:        GameResult;           // rempli seulement si status === FINISHED
  reason?:        string;              // message d'erreur si valid === false
}
