/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from './interfaces/compute-strategy.interface';
import { RandomBotStrategy } from './strategies/random-bot.strategy';

/* -------------------------------------------------------------------------- */
/*                       ~~ Class ComputePlayerService ~~                     */
/*                                                                            */
/* -------------------------------------------------------------------------- */


@Injectable()
export class ComputePlayerService {

    // On injecte notre stratégie aléatoire. Plus tard, on pourra injecter MinimaxBotStrategy
    constructor(private readonly strategy: RandomBotStrategy) {}

/**
 * Méthode appelée par ton GameService.
 * Elle est asynchrone pour simuler le temps de réflexion.
 *
*/
    async requestMove(board: any[][], color: string, legalMoves: Position[]): Promise<Position | null> {
        
        // Délai artificiel d'UX (ex: entre 400ms et 1200ms)[cite: 2]
        const thinkingTime = Math.floor(Math.random() * 800) + 400;
      
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demande à la stratégie de calculer le coup après le délai
                const move = this.strategy.computeMove(board, color, legalMoves);
                resolve(move);
            }, thinkingTime);
        });
    }
}

/* -------------------------------------------------------------------------- */
