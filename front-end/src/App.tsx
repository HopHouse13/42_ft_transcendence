import { useState } from 'react';
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import type { BoardState } from "./types/gameTypes";
import { INITIAL_BOARD } from "./constants/gameConstants";

const App =(): React.ReactElement => {
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
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
			<div className="lg:col-span-2">
				<Board xIsNext={xIsNext} board={currentBoard} onPlay={handlePlay} />
				<span className="flex justify-center mt-4 text-lg font-semibold">
					You are at move #{currentMove}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-4">
				<GameInfo 
				history={history}
				currentMove={currentMove}
				showLatestFirst={showLatestFirst}
				onReverse={() => setShowLatestFirst(!showLatestFirst)}
				onJumpTo={jumpTo}
				/>
			</div>
		</div>
	);
};

export default App
