import React from "react";
import type { SquareProps } from "../types/gameTypes";

export default function Square({value, onSquareClick, isPossibleMove}: SquareProps): React.ReactElement {
	const hasPawn = (value !== null) ;
	const pawnClass = (value === 'X') ? 'black-pawn' :
						(value === 'O') ? 'white-pawn' : '';

	return (
		<button
			className={`btn btn-primary hover:bg-base-300 ${isPossibleMove ? 'possibleMove' : ''}`}
			onClick={onSquareClick}
			aria-label={value === 'X' ? 'black pawn' :
				value === 'O' ? 'white pawn' :
				isPossibleMove ? 'possible move' : 'empty square'}
		>
			{hasPawn ? (
				<span className={`pawn ${pawnClass}`.trim()} />
			 ) : isPossibleMove && (
				<span className="possible-move-indicator" />
			 )}
		</button>
	);
}
