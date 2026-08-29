import {IsUUID, IsOptional, IsBoolean, IsEnum } from 'class-validator';
// import { GameMode } from '../enums/game-status.enum.ts'; //'../enums/game-mode.enum.ts';

export class CreateGameDto  {

/*
 * Id du joueur qui crée la partie (l'hôte).
 * C'est un UUID généré par ta table `users`.
*/
  @IsUUID()
  hostId: string ;

 /*
  * Id d'un adversaire précis si le joueur invite quelqu'un directement.
  * Optionnel: si absent, la partie peut être publique et attendre d'un
  * adversaire via la logique de matchmaking (game-room).
*/
  @IsOptional() @IsUUID()
  opponentID?: string;

/*
 * Partie privée (accessible seulement via un lien/code) ou publique
 * (visible dans une liste de parties en attente).
*/
  @IsOptional() @IsUUID()
  isPrivate?: boolean;
}
