/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

export interface Position   {
  
    row: number;
    col: number;
}

export interface BotStrategy    {
    
    // Prend l'état du plateau, la couleur du bot, et la liste pré-calculée des coups légaux
    computeMove(board: any[][], color: string, legalMoves: Position[]): Position | null;
}

/* -------------------------------------------------------------------------- */
