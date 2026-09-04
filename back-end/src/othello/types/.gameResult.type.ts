/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Player } from '../types/player.type'

export type GameResult =  {

  winner:      Player | 'DRAW' ;
  blackCount:  number ;
  whiteCount:  number ;

};
