/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from '../interfaces/compute-strategy.interface';

/* -------------------------------------------------------------------------- */
/*                         ~~ Class RandomBotStrategy ~~                      */
/*                                                                            */
/* -------------------------------------------------------------------------- */

@Injectable()
export class RandomBotStrategy implements BotStrategy   {
  
    computeMove(board: any[][], color: string, legalMoves: Position[]): Position | null {
        
        if (!legalMoves || legalMoves.length === 0) {
            return( null ); // Doit passer son tour
        }
    
        // Sélectionne un coup légal au hasard
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        
        return( legalMoves[randomIndex] );
    }
}

/* -------------------------------------------------------------------------- */
