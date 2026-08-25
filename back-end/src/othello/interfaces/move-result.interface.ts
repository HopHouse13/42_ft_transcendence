import { Cell } from './cell.interface';
import { PlayerColor } from '../enums/player-color.enum';
import { GameStatus } from '../enums/game-status.enum';

export interface Move {

  row: number;
  col: number;
}

export interface GameResult {

  winner: PlayerColor | 'DRAW';
  blackCount: number;
  whiteCount: number;
}

export interface MoveResult {

  valid:          boolean;              // le coup était-il légal ?
  board?:         Cell[];               // plateau (64 cases) après le coup, si valide
  flippedCells?:  Move[];               // pions retournés, pour l'animation côté front
  nextPlayer?:    PlayerColor;          // qui doit jouer ensuite
  status?:        GameStatus;           // partie en cours ou terminée ?
  result?:        GameResult;           // rempli seulement si status === FINISHED
  reason?:        string;              // message d'erreur si valid === false
}
