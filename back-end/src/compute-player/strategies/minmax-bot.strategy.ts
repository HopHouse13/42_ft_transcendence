/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable } from '@nestjs/common';
import { BotStrategy, Position } from '../interfaces/compute-strategy.interface';

import { OthelloEngine } from '../../othello/engine/othello-engine'
import { Cell } from '../../othello/types/cell.type';
import { Player } from '../../othello/types/player.type';
import { Move } from '../../othello/types/move.type';


/* -------------------------------------------------------------------------- */

interface Node  {
    
    value: number;
    move: Move;
    engine: OthelloEngine;
    
}

enum Depth {
    
    EASY = 2, MEDIUM = 5, HARD = 8,
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
      
        if ( true )     {
            
        }
      
        return( null );
    }
    

    /* -------------------------------------------------------------------------- */
    
    private _minmax(node: Node, depth: number, botPlayer: boolean): Node {
        
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
    }
    
    // tableaux de toute les possibiliter dans une position donner(node)
    private _getChildren(node: Node): Node[] {
            
        let allNode: Node[] = [];

         //cree une instance de engine pour cree larbre en manipulant le jeux
        allNode.push(node);
        return( allNode );
    }
    
    private _nodeEvalution(node: Node): Node {
        
        for( let row = 0; row < 8; row++ ) {
            
            for( let col = 0; col < 8; col++) {
                
                // aceder a la cell et regarder dans le la matrix si il faut aditionner ou soustraire le poid;
            }
        }
        return( node );
    }

}

/* -------------------------------------------------------------------------- */
