import { IsUUID } from 'class-validator';

export class JoingameDto {

/*
 * Utilisé typiquement sur une route REST (POST /othello/:gameId/join)
 * ou un event WebSocket ('joinGame').
 *
 * */
  @IsUUID()
  gameid: string;

/*
 * Id du joueur qui rejoint.
 *
 * */
  @IsUUID()
  playerID: string;
}
