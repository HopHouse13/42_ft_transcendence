/*
 *    ficher de la class othello-board 
 *  
 *  constructor: le constructeur accepte un tableau Cell[] optionnel (cells?).
 *                si vrais(cas du clone), on l'utilise tel quel
 *                sinon, cree un tableaux Cell de 64 ligne qui est soit (vide, noir, blanc)
 *                peut y acceder avec index = ligne * 8 + colone
 *                init les position de debut de partie
 *
 *  copy: une copy profonde de l objet OthelloBoard
 *        instance lobjet puis copy sont champs avec le spread operator{...obj}
 *        equivalent de this._cells.slice() ou boucle
 *
 *  method getCell: renvoie la valeur stocker dans une cellule
 *  method setCell: modifi la valeur de la cellule 
 *
 *  private methode _setupInitialPosition: init la position initial en debut de partie d othello 
 *  private methode _isValidPosition: renvoie un boolean si les valeur ligne et colone
 *                                    sont comprise dans le plateaux 
 * */

import { Cell } from './../interfaces/engine.interface'

export class OthelloBoard {

/*                               champs de la class                                 */

  private _cells: Cell[];

/*                    Constructeur et copy de la class OthelloBoard                */

    constructor(cells?: Cell[])   {
        
        if (cells) {
            
            this._cells = cells;
            
        } else {
            
            this._cells = Array(64).fill('EMPTY');
            this._setupInitialPosition();
        }
    }

    clone(): OthelloBoard   {

        return ( new OthelloBoard([...this._cells]) );
    }

/*                    Methode GET et SET de du champs Cell                    */

  getCell(row: number, col: number): Cell {

    if (!this._isValidPosition(row, col))   {

      throw new Error(`Position invalide: (${row}, ${col})`);
    }

    return( this._cells[row * 8 + col] );
  }

  getCellSafe(row: number, col: number): Cell | null {

    if (!this._isValidPosition(row, col)) {

      return( null );
    }

    return( this._cells[row * 8 + col]);
  }
  
  setCell(row: number, col: number, value: Cell): void  {

     if (!this._isValidPosition(row, col))   {

      throw new Error(`Position invalide: (${row}, ${col})`);
    }

    this._cells[row * 8 + col] = value;
  }

/*                    Methode private de la class                             */

  private _setupInitialPosition(): void   {

    this._cells[3 * 8 + 3] = 'WHITE'; this._cells[3 * 8 + 4] = 'BLACK'; // init line 4
    this._cells[4 * 8 + 3] = 'BLACK'; this._cells[4 * 8 + 4] = 'WHITE'; // init line 5

  }

  private _isValidPosition(row: number, col: number): boolean {

    return( (row >= 0 && row < 8) && (col >= 0 && col < 8) );
  }

}
