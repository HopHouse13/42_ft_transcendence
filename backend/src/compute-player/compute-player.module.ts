/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Module } from '@nestjs/common';

import { ComputePlayerService } from './compute-player.service';
import { RandomBotStrategy } from './strategies/random-bot.strategy';
import { MinmaxBotStrategy } from './strategies/minmax-bot.strategy';


/* -------------------------------------------------------------------------- */

@Module({

    providers: [RandomBotStrategy, ComputePlayerService, MinmaxBotStrategy],
    exports: [ComputePlayerService],
})
export class ComputePlayerModule {}
