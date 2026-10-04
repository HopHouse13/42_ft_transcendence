import Board from "../components/Board";
import type { PlayerColor, Position } from "../types/gameTypes";

import { useCreateGame } from '../hooks/useCreateGame';
import Lobby from '../components/Lobby';
import useGameSocket from '../hooks/useGameSocket';
import useMoveHistory from '../hooks/useMoveHistory';
import { useAuthContext } from '../hooks/useAuthContext';
import { toClientCell } from '../utils/cellConverter';
import GameHeader from "../components/GameHeader";
import History from "../components/History";

const Game =(): React.ReactElement => {
	const { mode, selectMode } = useCreateGame();
	const { isConnected, error, findMatch, startBotGame, waiting, gameState, playMove, isMovePending, isBotThinking } = useGameSocket(mode !== "LOCAL");
	const { user } = useAuthContext();

	const { history, showLatestFirst, toggleOrder } = useMoveHistory(gameState);

	// Couleur du joueur local, affichée à gauche comme dans le GameHeader
	const leftColor: PlayerColor = gameState?.players.find((player) => player.userId === user?.id)?.color
		?? gameState?.players[0]?.color
		?? 'BLACK';

	function handlePlay( nextMove: Position ) {
		if (isMovePending)
			return;

		playMove(nextMove);
	}

	return (
		(!gameState) ? (
			<Lobby
				mode={mode}
				selectMode={selectMode}
				onStart={mode === "BOT" ? startBotGame : findMatch}
				isConnected={isConnected}
				connectionError={error}
				waiting={waiting}
			/>
		) : (
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 ">
				<div className="lg:col-span-2">
						<GameHeader gameState={gameState} mode={mode}/>
					<Board
						board={gameState.cells.map(toClientCell)}
						validMoves={gameState.validMoves}
						onMove={handlePlay}
						disabled={isMovePending || isBotThinking}
					/>
					<div role="alert" className="flex justify-center mt-4 text-error text-lg font-semibold">
						{
							error
						}
					</div>
				</div>
				<div>
					<History
						history={history}
						leftColor={leftColor}
						showLatestFirst={showLatestFirst}
						onReverse={toggleOrder}
					/>
				</div>

			</div>
		)
	);
};

export default Game
