/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from '../interfaces/compute-strategy.interface';

import { Cell } from '../../othello/types/cell.type';
import { Player } from '../../othello/types/player.type';
import { Move } from '../../othello/types/move.type';

/* -------------------------------------------------------------------------- */
/*                         ~~ Class RandomBotStrategy ~~                      */
/*                                                                            */
/* -------------------------------------------------------------------------- */

@Injectable()
export class RandomBotStrategy implements BotStrategy {
  
  computeMove(cells: Cell[], color: Player, legalMoves: Move[]): Move | null {
    if (!legalMoves || legalMoves.length === 0) {
      return null;
    }
    
    // Sélectionne un coup légal au hasard
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }
}

/* -------------------------------------------------------------------------- */
