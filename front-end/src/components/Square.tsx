import React from "react";
import type { SquareProps } from "../types/gameTypes";

export default function Square({pos, value, onSquareClick, isPossibleMove}: SquareProps): React.ReactElement {
	const hasCell = (value !== null) ;
	const CellClass = (value === 'BLACK') ? 'black-Cell' :
						(value === 'WHITE') ? 'white-Cell' : '';

	return (
		<div
			className={`btn btn-lg ${(pos.col % 2) === (pos.row % 2)  ? "btn-primary" : "btn-secondary"} rounded-none justify-center aspect-square h-auto w-full`}
			onClick={onSquareClick}
			aria-label={value === 'BLACK' ? 'black Cell' :
				value === 'WHITE' ? 'white Cell' :
				isPossibleMove ? 'possible move' : 'empty square'}
		>
			{hasCell ? (
				<div className={`h-[60%] aspect-square rounded-full 
					${CellClass === 'black-Cell' 
					? 'bg-[#1d1d1d] shadow-lg shadow-black/40 inset-shadow-sm inset-shadow-white/20' 
					: 'bg-[#f0ede8] shadow-lg shadow-black/40 inset-shadow-sm inset-shadow-black'}`} />
			 ) : isPossibleMove && (
				<div className="h-[20%] aspect-square animate-pulse bg-[#1f1f1f50] rounded-full " />
			 )}
		</div>
	);
}
