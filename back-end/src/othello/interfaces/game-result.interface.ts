/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Player as PlayerColor } from './../types/player.type';

/* ========================================================================== */

export interface GameResult {

  winner: PlayerColor | 'DRAW';
  blackCount: number;
  whiteCount: number;
}
