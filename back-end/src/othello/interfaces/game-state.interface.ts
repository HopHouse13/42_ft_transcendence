import { Cell } from './cell.interface';
import { PlayerColor } from '../enums/player-color.enum';
import { GameStatus } from '../enums/game-status.enum';
import { Move, GameResult } from './move-result.interface';

export interface PlayerInfo {

  userId:     string;
  color:      PlayerColor;
  connected:  boolean;
}

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
