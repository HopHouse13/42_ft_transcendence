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

	const renderBoard = (): React.ReactElement => {
		return (
			<div className="card bg-base-200 shadow-xl p-4">
				{Array(8).fill(null).map((_, row: number) => (
					<div className="" key={row}>
						{Array(8).fill(null).map((_, col: number) => {
							// Convertit les coordonnées (row, col) en objet Position
							const cellPos = {row, col};
							return (
								<Square 
									key={getIndex(cellPos)} // Clé unique pour chaque case
									value={board[getIndex(cellPos)]} // Valeur de la case : 'BLACK', 'WHITE', ou null
									onSquareClick={() => handleClick(cellPos)} // Gestionnaire de clic avec la position
									isPossibleMove={validMoves.some(move => move.row === cellPos.row && move.col === cellPos.col)} // True si cette case est un coup valide
								/>
							);
						})}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="card bg-base-200 p-4 shadow-md">
			<div className="flex flex-col items-center justify-center gap-4">
				<div className="flex justify-center ">
					{renderBoard()}
				</div>
			</div>
		</div>
	);
}
