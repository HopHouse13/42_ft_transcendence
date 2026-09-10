import React from "react";
import type { SquareProps } from "../types/gameTypes";

export default function Square({value, onSquareClick, isPossibleMove}: SquareProps): React.ReactElement {
	const hasPawn = (value !== null) ;
	const pawnClass = (value === 'X') ? 'black-pawn' :
						(value === 'O') ? 'white-pawn' : '';

	return (
		<div
			className={`h-16 w-16 btn btn-xl btn-primary`}
			onClick={onSquareClick}
			aria-label={value === 'X' ? 'black pawn' :
				value === 'O' ? 'white pawn' :
				isPossibleMove ? 'possible move' : 'empty square'}
		>
			{hasPawn ? (
				<span className={`h-6 w-6 rounded-full ${pawnClass === 'black-pawn' ? 'bg-black' : 'bg-white'}`} />
			 ) : isPossibleMove && (
				<span className="h-6 w-6 rounded-full bg-[#ffff0080]" />
			 )}
		</div>
	);
}
