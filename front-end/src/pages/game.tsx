import Board from "../components/Board";
import type { Position } from "../types/gameTypes";

import { useCreateGame } from '../hooks/useCreateGame';
import Lobby from '../components/Lobby';
import useGameSocket from '../hooks/useGameSocket';
import { toClientCell } from '../utils/cellConverter';
import GameHeader from "../components/GameHeader";

const Game =(): React.ReactElement => {

    const { mode, selectMode } = useCreateGame();
    const { isConnected, error, findMatch, startBotGame, waiting, gameState, playMove, isMovePending, isBotThinking } = useGameSocket(mode !== "LOCAL");

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
                    <div className="w-full mb-2">
                        <GameHeader gameState={gameState} mode={mode}/>
                    </div>
                    <Board board={gameState.cells.map(toClientCell)} validMoves={gameState.validMoves} onMove={handlePlay} disabled={isMovePending || isBotThinking} />
                    <div role="alert" className="flex justify-center mt-4 text-error text-lg font-semibold">
                        {
                            error
                        }
                    </div>
                </div>
            </div>
        )
    );
};

export default Game
