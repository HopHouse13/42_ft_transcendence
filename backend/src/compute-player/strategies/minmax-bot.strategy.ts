/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from '../interfaces/compute-strategy.interface';

import { OthelloEngine } from '../../othello/engine/othello-engine'
import { Player } from '../../othello/types/player.type';
import { Cell } from '../../othello/types/cell.type';
import { Move } from '../../othello/types/move.type';


/* -------------------------------------------------------------------------- */

interface level {
    
    depth: Depth;
    weight: number[];
}

interface Node  {
    
    value: number;
    move: Move | null;
    engine: OthelloEngine;
    
}

enum Depth {
    
    EASY = 1, MEDIUM = 2, HARD = 4,
}

const WEIGHTS: number[] = [
    
    120, -20,  20,   5,   5,  20, -20, 120,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
     20,  -5,  15,   3,   3,  15,  -5,  20,
      5,  -5,   3,   3,   3,   3,  -5,   5,
      5,  -5,   3,   3,   3,   3,  -5,   5,
     20,  -5,  15,   3,   3,  15,  -5,  20,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
    120, -20,  20,   5,   5,  20, -20, 120,
    
    ];

const ONEWEIGHTS: number[] = [
    
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    
    ];

/* -------------------------------------------------------------------------- */
/*                         ~~ Class MinmaxBotStrategy ~~                      */
/*                                                                            */
/* -------------------------------------------------------------------------- */

@Injectable()
export class MinmaxBotStrategy implements BotStrategy {
  
    private readonly _engine: OthelloEngine;
    
    computeMove(cells: Cell[], color: Player, legalMoves: Move[]): Move | null {
      if (!legalMoves || legalMoves.length === 0) return null;

      const root = OthelloEngine.fromState(cells, color);
      let best: Move = legalMoves[0];
      let bestValue = -Infinity;

      for (const move of legalMoves) {
        const child = root.clone();
        child.playMove(move, color);
        const value = this._search(child, Depth.EASY - 1, -Infinity, Infinity, color);
        if (value > bestValue) { bestValue = value; best = move; }
      }
      return best;
    }
    
    /* -------------------------------------------------------------------------- */
    /*                            ~~ Private Methode ~~                           */
    /*                                                                            */
    /* -------------------------------------------------------------------------- */

    private _search(engine: OthelloEngine, depth: number, alpha: number, beta: number, botColor: Player): number {
      if (engine.isGameOver()) return this._terminalScore(engine, botColor);
      if (depth === 0)         return this._evaluate(engine, botColor);

      const current = engine.getCurrentPlayer();
      const maximizing = current === botColor;
      let value = maximizing ? -Infinity : Infinity;

      for (const move of engine.allValidMove(current)) {
        const child = engine.clone();
        child.playMove(move, current);
        const v = this._search(child, depth - 1, alpha, beta, botColor);

        if (maximizing) { value = Math.max(value, v); alpha = Math.max(alpha, value); }
        else            { value = Math.min(value, v); beta  = Math.min(beta,  value); }
        if (beta <= alpha) break;
      }
      return value;
    }
    
    /* -------------------------------------------------------------------------- */

    private _terminalScore(engine: OthelloEngine, botColor: Player): number {
            const r = engine.returnResult();
            const diff = botColor === 'BLACK' ? r.blackCount - r.whiteCount
                                              : r.whiteCount - r.blackCount;
            return diff * 1000;
        }

    /* -------------------------------------------------------------------------- */

    private _evaluate(engine: OthelloEngine, botColor: Player): number {

            const board = engine.getBoard();
            const opponentColor: Player = botColor === 'BLACK' ? 'WHITE' : 'BLACK';
            let score = 0;

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const cell = board.getCell(row, col);
                    const weight = ONEWEIGHTS[row * 8 + col];

                    if (cell === botColor)           score += weight;
                    else if (cell === opponentColor) score -= weight;
                }
            }

            const botMobility = engine.allValidMove(botColor).length;
            const opponentMobility = engine.allValidMove(opponentColor).length;
            score += (botMobility - opponentMobility) * 5;

            return score;
        }
    
    
    

}

/* -------------------------------------------------------------------------- */
/*
private _evaluate(node: Node, botColor: Player): number {
    
    const board = node.engine.getBoard();
    const opponentColor: Player = botColor === 'BLACK' ? 'WHITE' : 'BLACK';
    let score = 0;

    for (let row = 0; row < 8; row++)   {
        for (let col = 0; col < 8; col++)     {
            
            const cell = board.getCell(row, col);
            const weight = WEIGHTS[row * 8 + col];

            if (cell === botColor) {
                
                score += weight;
                
            } else if (cell === opponentColor) {
                
                score -= weight;
        }
      }
    }

    const botMobility = node.engine.allValidMove(botColor).length;
    const opponentMobility = node.engine.allValidMove(opponentColor).length;
    score += (botMobility - opponentMobility) * 5;

    return( score );
}*/
/*private _minmax(node: Node, depth: number, botPlayer: boolean): Node {
    
    if ( depth === 0 || this._engine.isGameOver() )   {
        
        return( this._nodeEvalution(node) );
    }
    
    if ( botPlayer === true ) {
        
        const max_value = Infinity; const allChildren: Node[] = this._getChildren(node); let maxNode = node;
        for( const childNode of allChildren  ) {
            
            maxNode = this._minmax(node, (depth - 1), false);
            ( maxNode.value < max_value )? maxNode.value = max_value : max_value ;
        }
        return( maxNode );
        
    } else {
        
        const min_value = -Infinity; const allChildren: Node[] = this._getChildren(node); let minNode = node;
        for( const move of allChildren ) {
            
            minNode = this._minmax(node, (depth - 1), true);
            ( minNode.value > min_value )? minNode.value = min_value : min_value;
        }
        return( minNode );
    }
}*/
/*  private _minmax(node: Node, depth: number, isMaximizing: boolean, botColor: Player): Node {
 
 const children = this._getChildren(node);
 if ( depth === 0 || node.engine.isGameOver() || children.length === 0) {
   
     node.value = this._nodeEvaluation(node, botColor);
     return( node );
 }

 if ( isMaximizing )   {
     
     let maxNode: Node = { ...node, value: -Infinity };

     for (const child of children)   {
         
         const evalNode = this._minmax(child, depth - 1, false, botColor);
         if (evalNode.value > maxNode.value) {
             
             maxNode.value = evalNode.value; maxNode.move = child.move;
         }
   }
 
     return( maxNode );
 }   else    {
     
     let minNode: Node = { ...node, value: Infinity };

     for (const child of children) {
     
         const evalNode = this._minmax(child, depth - 1, true, botColor);
         if (evalNode.value < minNode.value) {
       
             minNode.value = evalNode.value; minNode.move = child.move;
         }
     }
     return( minNode );
 }
 
}

/* -------------------------------------------------------------------------- */

/*
private _getChildren(node: Node): Node[]    {
 
 const children: Node[] = [];
 const currentPlayer = node.engine.getCurrentPlayer();
 const validMoves = node.engine.allValidMove(currentPlayer);

 for (const move of validMoves)  {
 
     const engineClone = new OthelloEngine();
     const sourceBoard = node.engine.getBoard();
     const targetBoard = engineClone.getBoard();

     for (let r = 0; r < 8; r++) {
         for (let c = 0; c < 8; c++) {
             
             targetBoard.setCell(r, c, sourceBoard.getCell(r, c));
         }
       }

     try {
         
         engineClone.playMove(move, currentPlayer);
         children.push( {value: 0, move, engine: engineClone,} );
         
     } catch (e) {
         
     }
 }
 return( children );
}
*/
