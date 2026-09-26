/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from './interfaces/compute-strategy.interface';
import { RandomBotStrategy } from './strategies/random-bot.strategy';

import { Cell } from '../othello/types/cell.type';
import { Player } from '../othello/types/player.type';
import { Move } from '../othello/types/move.type';

// ... le reste de ta classe ComputePlayerService reste identique
/* -------------------------------------------------------------------------- */
/*                       ~~ Class ComputePlayerService ~~                     */
/*                                                                            */
/* -------------------------------------------------------------------------- */


@Injectable()
export class ComputePlayerService {

    constructor(private readonly strategy: RandomBotStrategy) {}

    async requestMove(cells: Cell[], color: Player, legalMoves: Move[]): Promise<Move | null> {
        
        const thinkingTime = Math.floor(Math.random() * 800) + 400;
      
        return new Promise((resolve) => {
            setTimeout(() => {
                const move = this.strategy.computeMove(cells, color, legalMoves);
                resolve(move);
            }, thinkingTime);
        });
    }
}
/* -------------------------------------------------------------------------- */
