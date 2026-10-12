/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Player as PlayerColor } from '../types/player.type';

/* ========================================================================== */

export interface PlayerInfo {

  userId:     string;
  color:      PlayerColor;
  connected:  boolean;
}
