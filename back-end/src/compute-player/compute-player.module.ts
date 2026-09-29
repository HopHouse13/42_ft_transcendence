/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Module } from '@nestjs/common';

import { ComputePlayerService } from './compute-player.service';
import { RandomBotStrategy } from './strategies/random-bot.strategy';

/* -------------------------------------------------------------------------- */

@Module({

    providers: [RandomBotStrategy, ComputePlayerService],
    exports: [ComputePlayerService],
})
export class ComputePlayerModule {}
