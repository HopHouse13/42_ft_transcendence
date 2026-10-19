import { GameStatus } from '../../othello/enums/game-status.enum';

export type ServerCell = 'BLACK' | 'WHITE' | 'EMPTY';

export interface SpectatorPlayerData {
  username: string;
  avatarUrl: string;
  color: 'BLACK' | 'WHITE';
  score: number;
  elo: number;
}

export interface LiveGamePayload {
  gameId: string;
  player1: SpectatorPlayerData;
  player2: SpectatorPlayerData;
  currentPlayer: 'BLACK' | 'WHITE';
  spectators: number;
  startedAt: string; // live duration calculated in the frontend
  duration: string; // finished game
  status: GameStatus;
  isBot: boolean;
  board: ServerCell[];
}
