import { Type } from 'class-transformer' ;
import { IsInt, Min, Max } from 'class-validator' ;
import { IsUUID, IsString, IsNotEmpty, ValidateNested } from 'class-validator' ;

class MoveDto   {
    
/* *
 * Limite du plateau (0 à 7 pour un plateau 8x8).
 * Ligne visée (row)/Colonne visée (col)
 *
 */
      @IsInt() @Min(0) @Max(7)
      row: number;

      @IsInt() @Min(0) @Max(7)
      col: number;
    
}

export class PlayMoveDto {

/* *
 * Id de la partie concernée/en cour.
 *
 */
    @IsUUID() @IsString() @IsNotEmpty()
    gameId: string;

/* *
 * Id du joueur qui joue le coup.
 * Sert à vérifier côté service que c'est bien SON tour de jouer
 * ( le DTO ne valide QUE le format, pas la logique de jeu)
 *
 */
    @IsUUID() @IsString() @IsNotEmpty()
    playerId: string;

    @ValidateNested() @Type( () => MoveDto )
    move: MoveDto;
}
