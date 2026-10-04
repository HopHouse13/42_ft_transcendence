import React from "react";
import type { BoardProps, Position } from "../types/gameTypes";
import Square from "./Square";
import { getIndex } from "../logic/gameLogic";

export default function Board({ board, validMoves, onMove, disabled}: BoardProps): React.ReactElement {

	function handleClick(pos: Position): void {
		if (disabled 
			|| board[getIndex(pos)] !== null
			|| !validMoves.some(move => move.col === pos.col && move.row === pos.row ))
			return;

		onMove(pos);
	}
//  
	return (
		<div className="bg-[url(/wood.svg)] rounded-lg shadow-xl p-4">
			<div className="grid grid-cols-8 bg-primary rounded-lg">
				{Array(8).fill(null).map((_, row: number) => (
					Array(8).fill(null).map((_, col: number) => {
						const index = getIndex({row, col});
						return (
							<Square 
							key={index} // Clé unique pour chaque case
							pos={{row, col}}
							value={board[index]} // Valeur de la case : 'BLACK', 'WHITE', ou null
							onSquareClick={() => handleClick({row, col})} // Gestionnaire de clic avec la position
							isPossibleMove={validMoves.some(move => move.row === row && move.col ===  col)} // True si cette case est un coup valide
							/>
						);
					})
				))}
			</div>
		</div>
	);
}
