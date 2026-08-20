import React from "react";
import { BoardState } from "../types/gameTypes";
import { getStatusText } from "../logic/gameLogic";

interface StatusBarProps {
	board: BoardState;
	xIsNext: boolean;
	currentPlayerHasMoves: boolean;
	opponentHasMoves: boolean;
}

export default function StatusBar({board, xIsNext, currentPlayerHasMoves, opponentHasMoves}: StatusBarProps):React.ReactElement {
	const statusText = getStatusText(board, xIsNext, currentPlayerHasMoves, opponentHasMoves);
	return (
		<div className="Status">{statusText}</div>
	);
}
