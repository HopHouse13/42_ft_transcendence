import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class JoingameDto {

/*
 * Utilisé typiquement sur une route REST (POST /othello/:gameId/join)
 * ou un event WebSocket ('joinGame').
 *
 * */
  @IsUUID() @IsString() @IsNotEmpty() 
  gameId: string;

/*
 * Id du joueur qui rejoint.
 *
 * */
  @IsUUID() @IsString() @IsNotEmpty()
  userId: string;
}
