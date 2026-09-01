/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

/*
 *
 *
 *
 * */

import { OthelloBoard, Cell} from './othello-board'

/*               Definition of type use in OthelloEngine             */

export type Player = 'BLACK' | 'WHITE'

export type Move =  { 

  row: number; 
  col: number; 

};

export type GameResult =  {

  winner:      Player | 'DRAW' ;
  blackCount:  number ;
  whiteCount:  number ;

};

const DIRECTIONS: [number, number][] = [

  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

/*               Definition of class OthelloEngine             */

export class OthelloEngine  {

/*            definition of champs          */
  
  private _board:         OthelloBoard;
  private _currentPlayer: Player;

/*               Constructeur               */

  constructor()  {

    this._board = new OthelloBoard();
    this._currentPlayer = 'BLACK';
  }

/*        Methode GET for champs            */

  getBoard(): OthelloBoard  {
    
    return( this._board );
  }

  getCurrentPlayer(): Player  {

    return( this._currentPlayer );
  }

/*            Valide Move                     */

  // doit verifier: case vide + au moin une direction qui capture
  isValidMove(move: Move, player: Player): boolean   {
    
    if ( this._board.getCellSafe(move.row, move.col) !== 'EMPTY') {

      return( false );
    }

    return( (this._capturedCells(move, player)).length > 0 );
  }

  // parcourt les 64 case, garde celles ou isValidMove est vrai
  allValidMove(player: Player): Move[] {
    
    const validMoves: Move[] = [];

    for(let row = 0; row < 8; row++)  {

      for(let col = 0; col < 8; col++)
      {

        const currMove: Move = { row, col };
        if (this.isValidMove(currMove, player))
          validMoves.push(currMove);
      }
    }

    return( validMoves );
  }

/*       jouer un tour              */

  //valid le coup, pose le piont, retourne,change _currentPlayer (ou passe le tour si l adverser peux pas jouer )
  playMove(move: Move, player: Player): void  {
    
    if (player !== this._currentPlayer)   {

      throw new Error(`Ce n'est pas le tour de ${player}`);
    }

    if (!this.isValidMove(move, player))  {

      throw new Error(`Coup invalide: (${move.row}, ${move.col})`);
    }

    const captured = this._capturedCells(move, player);

    this._board.setCell(move.row, move.col, player);
    for (const cell of captured)    {

      this._board.setCell(cell.row, cell.col, player);
    }

    this._advanceTurn(player);
  }

/*             Fin de partie                                */

  // vrai si aucun des deux joueurs n'a de coup valide
  isGameOver(): boolean {
    
    const blackCanPlay = this.allValidMove('BLACK').length > 0;
    const whiteCanPlay = this.allValidMove('WHITE').length > 0;

    return( !blackCanPlay && !whiteCanPlay );
  }
  
  returnResult(): GameResult  {
  
    let blackCount = 0; let whiteCount = 0;
    for (let row = 0; row < 8; row++ )  {
      
      for (let col = 0; col < 8; col++) {

        const cell = this._board.getCellSafe(row, col);
        if (cell === 'BLACK')
          blackCount++ ; 
        
        else if(cell === 'WHITE')
          whiteCount++ ;
      }
    }

    let winner: Player | 'DRAW' =
    (blackCount > whiteCount)? 'BLACK' :
    (blackCount < whiteCount)? 'WHITE' : 'DRAW';
    

    return( {winner, blackCount, whiteCount} );
  }

/*            Methode priver de la class                    */
  
  // pour chaque direction, cherche une ligne capturable
  // renvoie la liste des cases qui seraient retournées
  private _capturedCells(move: Move, player: Player): Move[]  {

    const opponent = this._opponent(player);
    const allCaptured: Move[] = []
    
    for(const[dRow, dCol] of DIRECTIONS)    {

      const capturedInThisDirection: Move[] = [];
      let row = move.row + dRow;
      let col = move.col + dCol;

      while(this._board.getCellSafe(row, col) === opponent) {

        capturedInThisDirection.push( {row, col} );
        row += dRow ;
        col += dCol ;
      }

      if ( capturedInThisDirection.length > 0 && this._board.getCellSafe(row, col) === player)   {

        allCaptured.push(...capturedInThisDirection);
      }
    }

    return( allCaptured );
  }
  
  private _advanceTurn(player: Player): void  {

    const opponent = this._opponent(player);
    
    if(this.allValidMove(opponent).length > 0)
      this._currentPlayer = opponent;

    else
      this._currentPlayer = player;
  }

  private _opponent(player: Player): Player   {

    return( (player === 'BLACK')? 'WHITE' : 'BLACK' );
  }
}
