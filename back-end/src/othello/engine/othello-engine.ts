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

    throw new Error('Not implemented');
  }

  // parcourt les 64 case, garde celles ou isValidMove est vrai
  allValidMove(player: Player): Move[] {
    
    throw new Error('Not implemented');
  }

/*       jouer un tour              */

  //valid le coup, pose le piont, retourne,change _currentPlayer (ou passe le tour si l adverser peux pas jouer )
  playMove(move: Move, player: Player): void  {

    throw new Error('Not implemented');
  }

/*             Fin de partie                                */

  // vrai si aucun des deux joueurs n'a de coup valide
  isGameOver(): boolean {

    throw new Error('Not implemented');
  }
  
  returnResult(): GameResult  {
  
    throw new Error('Not implemented');
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

      while(this._board.getCell(row, col) === opponent) {

        capturedInThisDirection.push( {row, col} );
        row += dRow ;
        col += dCol ;
      }

      if ( capturedInThisDirection.length > 0 && this._board.getCell(row, col) === player)   {

        allCaptured.push(...capturedInThisDirection);
      }
    }

    return( allCaptured );
  }

  private _opponent(player: Player): Player   {

    return( (player === 'BLACK')? 'WHITE' : 'BLACK' );
  }
}
