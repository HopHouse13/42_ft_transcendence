/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */
import { Cell } from '../../othello/types/cell.type';
import { Player } from '../../othello/types/player.type';
import { Move } from '../../othello/types/move.type';

/* -------------------------------------------------------------------------- */

export interface Position   {
  
    row: number;
    col: number;
}

export interface BotStrategy    {
    
    // Prend l'état du plateau, la couleur du bot, et la liste pré-calculée des coups légaux
    computeMove(cells: Cell[], color: Player, legalMoves: Move[]): Move | null;
}

/* -------------------------------------------------------------------------- */
