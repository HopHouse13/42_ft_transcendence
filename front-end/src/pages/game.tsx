import { useState } from 'react';
import Board from "../components/Board";
import GameInfo from "../components/GameInfo";
import Chat from "../components/Chat";
import type { BoardState, Position } from "../types/gameTypes";
import { INITIAL_BOARD } from "../constants/gameConstants";

import { useCreateGame } from '../hooks/useCreateGame';
import Lobby from '../components/Lobby';
import useGameSocket from '../hooks/useGameSocket';
import { toClientCell } from '../utils/cellConverter';

const Game = (): React.ReactElement => {
    const [showLatestFirst, setShowLatestFirst] = useState<boolean>(false);
    const [history, setHistory] = useState<BoardState[]>([INITIAL_BOARD]);
    const [currentMove, setCurrentMove] = useState<number>(0);

    const [activeTab, setActiveTab] = useState<'history' | 'chat'>('history');

    const currentBoard: BoardState = history[currentMove];

    function handlePlay(nextMove: Position) {
        playMove(nextMove);
    }

    function jumpTo(nextMove: number): void {
        setCurrentMove(nextMove);
    }

    const { mode, selectMode } = useCreateGame();
    
    //  AJOUT DE `socket` ICI
    const { socket, isConnected, error, findMatch, waiting, gameState, playMove } = useGameSocket(mode === "ONLINE");

    const displayedBoard = gameState
        ? gameState.cells.map(toClientCell)
        : currentBoard;

    return (
        (!gameState) ? (
            <Lobby
                mode={mode}
                selectMode={selectMode}
                onStart={findMatch}
                isConnected={isConnected}
                connectionError={error}
                waiting={waiting}
            />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                {/* Plateau de jeu */}
                <div className="lg:col-span-2">
                    <Board board={displayedBoard} validMoves={gameState.validMoves} onMove={handlePlay} />
                    <span className="flex justify-center mt-4 text-lg font-semibold">
                        You are at move #{currentMove}
                    </span>
                </div>

                {/* Colonne latérale */}
                <div className="flex flex-col gap-4">
                    {/* Navigation Onglets */}
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'history'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Historique
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'chat'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Chat
                        </button>
                    </div>

                    {/* Contenu conditionnel */}
                    {activeTab === 'history' ? (
                        <GameInfo
                            history={history}
                            currentMove={currentMove}
                            showLatestFirst={showLatestFirst}
                            onReverse={() => setShowLatestFirst(!showLatestFirst)}
                            onJumpTo={jumpTo}
                        />
                    ) : (
                        socket && gameState.gameId ? (
                            <Chat socket={socket} gameId={gameState.gameId} />
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                Connexion au tchat...
                            </div>
                        )
                    )}
                </div>
            </div>
        )
    );
};

export default Game;
