import { useState } from 'react';
import Board from "../components/Board";
import GameInfo from "../components/GameInfo";
import type { BoardState, Position } from "../types/gameTypes";
import { INITIAL_BOARD } from "../constants/gameConstants";

import { useCreateGame } from '../hooks/useCreateGame';
import Lobby from '../components/Lobby';
import useGameSocket from '../hooks/useGameSocket';
import { toClientCell } from '../utils/cellConverter';

const Game =(): React.ReactElement => {
	const [showLatestFirst, setShowLatestFirst] = useState<boolean>(false);
	const [history, setHistory] = useState<BoardState[]>([INITIAL_BOARD]);
	const [currentMove, setCurrentMove] = useState<number>(0);

	const currentBoard: BoardState = history[currentMove];

	// function handlePlay(nextBoard: BoardState): void {
	// 	const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextBoard];
	// 	setHistory(nextHistory);
	// 	setCurrentMove(nextHistory.length - 1);
	// }
	function handlePlay( nextMove: Position ){
		void nextMove;
		void setHistory;
		playMove(nextMove);
		return;
	}

	function jumpTo(nextMove: number): void {
		setCurrentMove(nextMove);
	}

	const { mode, selectMode } = useCreateGame();
	const { isConnected, error, findMatch, waiting, gameState, playMove } = useGameSocket(mode === "ONLINE");

	// const xIsNext = gameState?.currentPlayer === 'BLACK';


	const displayedBoard = gameState
		? gameState.cells.map(toClientCell)
		: currentBoard;

	return (
		(!gameState) ? (
			<Lobby
				mode={mode}
				selectMode={selectMode}
				onStart={ findMatch }
				isConnected={isConnected}
				connectionError={error}
				waiting={waiting}
			/>
		) : (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
			<div className="lg:col-span-2">
				<Board board={displayedBoard} validMoves={gameState.validMoves} onMove={handlePlay} />
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
		)
	);
};

export default Game
