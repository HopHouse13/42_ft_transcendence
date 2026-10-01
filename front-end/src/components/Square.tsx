import React from "react";
import type { SquareProps } from "../types/gameTypes";

export default function Square({value, onSquareClick, isPossibleMove}: SquareProps): React.ReactElement {
	const hasCell = (value !== null) ;
	const CellClass = (value === 'BLACK') ? 'black-Cell' :
						(value === 'WHITE') ? 'white-Cell' : '';

	return (
		<div
			className={`h-16 w-16 btn btn-xl btn-primary p-0 m-0`}
			onClick={onSquareClick}
			aria-label={value === 'BLACK' ? 'black Cell' :
				value === 'WHITE' ? 'white Cell' :
				isPossibleMove ? 'possible move' : 'empty square'}
		>
			{hasCell ? (
				<span className={`h-6 w-6 rounded-full ${CellClass === 'black-Cell' ? 'bg-black' : 'bg-white'}`} />
			 ) : isPossibleMove && (
				<span className="h-6 w-6 rounded-full bg-[#ffff0080]" />
			 )}
		</div>
	);
}
