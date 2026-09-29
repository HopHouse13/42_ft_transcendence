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

interface Node  {
    
    value: number;
    move: Move | null;
    engine: OthelloEngine;
    
}

enum Depth {
    
    EASY = 2, MEDIUM = 4, HARD = 6,
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

/* -------------------------------------------------------------------------- */
/*                         ~~ Class MinmaxBotStrategy ~~                      */
/*                                                                            */
/* -------------------------------------------------------------------------- */

@Injectable()
export class MinmaxBotStrategy implements BotStrategy {
  
    private readonly _engine: OthelloEngine;
    
    computeMove(cells: Cell[], color: Player, legalMoves: Move[]): Move | null {
        
        if (!legalMoves || legalMoves.length === 0)     {
          
            return( null );
        }

        const engine = new OthelloEngine();
        const board = engine.getBoard();

        for (let r = 0; r < 8; r++)     {
            for (let c = 0; c < 8; c++)   {
            
                const cellValue = cells[r * 8 + c];
                board.setCell(r, c, cellValue);
            }
        }

        const rootNode: Node = { value: 0, move: null, engine, };
        const bestNode = this._minmax(rootNode, Depth.MEDIUM, true, color);
        
        return( bestNode.move );
      }

    /* -------------------------------------------------------------------------- */
    /*                            ~~ Private Methode ~~                           */
    /*                                                                            */
    /* -------------------------------------------------------------------------- */
    
    private _minmax(node: Node, depth: number, isMaximizing: boolean, botColor: Player): Node {
        
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

    /* -------------------------------------------------------------------------- */
      
    private _nodeEvaluation(node: Node, botColor: Player): number {
        
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
    }
    

}

/* -------------------------------------------------------------------------- */

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
