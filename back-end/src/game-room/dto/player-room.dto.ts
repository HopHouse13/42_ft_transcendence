
/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Type } from 'class-transformer' ;
import { IsInt, Min, Max } from 'class-validator' ;
import { IsUUID, IsString, IsNotEmpty, ValidateNested } from 'class-validator' ;

/* -------------------------------------------------------------------------- */
/*                     ~~ DTO Interface PlayerRoom ~~                         */
/*                                                                            */
/*  Il n'existe pas de décorateur natif nommé @IsSocket()                     */
/*  dans NestJS ni dans la bibliothèque standard class-validator              */
/* -------------------------------------------------------------------------- */

export class PlayerRoomDto  {
    
    @IsNotEmpty() @IsString() @IsUUID()
    userId: string;
    
    @IsNotEmpty()
    socketId: string;
    
    @IsString()
    color?: string;

    @IsString() @IsUUID()
    invit?: string
        
}

/* -------------------------------------------------------------------------- */
