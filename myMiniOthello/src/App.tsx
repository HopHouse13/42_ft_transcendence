import React, { useState } from "react";
import Layout from "./components/Layout";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import { BoardState } from "./types/gameTypes";
import { INITIAL_BOARD } from "./constants/gameConstants";

export default function App(): React.ReactElement {
	const [showLatestFirst, setShowLatestFirst] = useState<boolean>(false);
	const [history, setHistory] = useState<BoardState[]>([INITIAL_BOARD]);
	const [currentMove, setCurrentMove] = useState<number>(0);

	const xIsNext: boolean = currentMove % 2 === 0;
	const currentBoard: BoardState = history[currentMove];

	function handlePlay(nextBoard: BoardState): void {
		const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextBoard];
		setHistory(nextHistory);
		setCurrentMove(nextHistory.length - 1);
	}

	function jumpTo(nextMove: number): void {
		setCurrentMove(nextMove);
	}

	return (
		<Layout>
			<div className="game">
				<div className="game-board">
					<Board xIsNext={xIsNext} board={currentBoard} onPlay={handlePlay} />
					<span className="move-info">
						You are at move #{currentMove}
					</span>
				</div>
				<GameInfo 
					history={history}
					currentMove={currentMove}
					showLatestFirst={showLatestFirst}
					onReverse={() => setShowLatestFirst(!showLatestFirst)}
					onJumpTo={jumpTo}
					/>
			</div>
		</Layout>
	)
}
