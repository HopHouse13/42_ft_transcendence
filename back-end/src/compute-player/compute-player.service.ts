/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from './interfaces/compute-strategy.interface';
import { RandomBotStrategy } from './strategies/random-bot.strategy';
import { MinmaxBotStrategy } from './strategies/minmax-bot.strategy';

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


    constructor(
        private readonly minmaxStrategy: MinmaxBotStrategy, 
        private readonly randomStrategy: RandomBotStrategy
    ) {}


    async requestMove(cells: Cell[], color: Player, legalMoves: Move[]): Promise<Move | null> {
        
        const thinkingTime = Math.floor(Math.random() * 800) + 400;
        
        return new Promise((resolve) => {

            setTimeout(() => {

                const randomChance = 0.50; 
                const shouldUseRandom = Math.random() < randomChance;

                let move: Move | null = null;

                if (shouldUseRandom && legalMoves.length > 0) {

                    move = this.randomStrategy.computeMove(cells, color, legalMoves);
                } else {

                    move = this.minmaxStrategy.computeMove(cells, color, legalMoves);
                }

                resolve(move);
            }, 
                thinkingTime);
        });
    }
}
/* -------------------------------------------------------------------------- */
