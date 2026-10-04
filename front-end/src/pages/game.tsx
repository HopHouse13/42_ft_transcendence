import Board from "../components/Board";
import type { Position } from "../types/gameTypes";

import { useCreateGame } from '../hooks/useCreateGame';
import Lobby from '../components/Lobby';
import useGameSocket from '../hooks/useGameSocket';
import { useLocalGame } from '../hooks/useLocalGame';
import { toClientCell } from '../utils/cellConverter';
import GameHeader from "../components/GameHeader";
import LocalGame from "../components/LocalGame";

const Game = (): React.ReactElement => {
    const { mode, selectMode } = useCreateGame();
    const { isConnected, error, findMatch, startBotGame, waiting, gameState, playMove, isMovePending, isBotThinking } = useGameSocket(mode !== "LOCAL");
    const local = useLocalGame();

    function handlePlay(nextMove: Position) {
        if (isMovePending)
            return;
        playMove(nextMove);
    }

    function handleStart() {
        if (mode === "LOCAL") local.start();
        else if (mode === "BOT") startBotGame();
        else findMatch();
    }

    if (mode === "LOCAL" && local.started) {
        return (
            <LocalGame
                board={local.board}
                currentPlayer={local.currentPlayer}
                validMoves={local.validMoves}
                blackScore={local.blackScore}
                whiteScore={local.whiteScore}
                isFinished={local.isFinished}
                winner={local.winner}
                notice={local.notice}
                onMove={local.playMove}
                onRestart={local.start}
                onQuit={local.quit}
            />
        );
    }

    return (
        (!gameState || mode === "LOCAL") ? (
            <Lobby
                mode={mode}
                selectMode={selectMode}
                onStart={handleStart}
                isConnected={isConnected}
                connectionError={error}
                waiting={waiting}
            />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 ">
                <div className="lg:col-span-2">
                    <div className="w-full mb-2">
                        <GameHeader gameState={gameState} mode={gameState.mode}/>
                    </div>
                    <Board board={gameState.cells.map(toClientCell)} validMoves={gameState.validMoves} onMove={handlePlay} disabled={isMovePending || isBotThinking} />
                    <div role="alert" className="flex justify-center mt-4 text-error text-lg font-semibold">
                        {error}
                    </div>
                </div>
            </div>
        )
    );
};

export default Game
