import React, { useState } from "react";
import Board from "./Board";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";
import History from "./History";
import type { Player, BoardState, Position, MoveHistoryEntry } from "../types/gameTypes";
import type { LocalMoveHistoryEntry } from "../hooks/useLocalGame";
import { BOARD_SIZE } from "../constants/gameConstants";
import { getIndex } from "../logic/gameLogic";

interface LocalGameProps {
    board: BoardState;
    currentPlayer: Player;
    validMoves: Position[];
    blackScore: number;
    whiteScore: number;
    isFinished: boolean;
    winner: Player | "DRAW" | null;
    notice: string | null;
    moveHistory?: LocalMoveHistoryEntry[];
    onMove: (pos: Position) => void;
    onRestart: () => void;
    onQuit: () => void;
}

function createInitialBoard(): BoardState {
    const board: BoardState = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    const mid = BOARD_SIZE / 2;
    board[getIndex({ row: mid - 1, col: mid - 1 })] = "WHITE";
    board[getIndex({ row: mid - 1, col: mid })] = "BLACK";
    board[getIndex({ row: mid, col: mid - 1 })] = "BLACK";
    board[getIndex({ row: mid, col: mid })] = "WHITE";
    return board;
}

const LocalGame = ({
    board, currentPlayer, validMoves, blackScore, whiteScore,
    isFinished, winner, notice, moveHistory = [], onMove, onRestart, onQuit,
}: LocalGameProps): React.ReactElement => {
    const [showLatestFirst, setShowLatestFirst] = useState(true);

    // Représentation initiale à l'index 0
    const initialEntry: MoveHistoryEntry = {
        board: createInitialBoard(),
        player: null,
        position: null,
        flippedCount: 0,
        passed: false,
    };

    // Assemblage de l'historique lisible par History.tsx
    const formattedHistory: MoveHistoryEntry[] = [
        initialEntry,
        ...moveHistory.map((entry) => ({
            board: entry.board,
            player: entry.player,
            position: entry.position,
            flippedCount: 0,
            passed: false,
        })),
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 w-full">
            <div className="flex flex-col lg:col-span-2 gap-4 items-center">
                <div className="flex flex-row gap-4 w-full items-center max-w-3xl">
                    <div className="flex min-w-0 flex-1">
                        <PlayerCard
                            player={{ userId: "black", color: "BLACK", connected: true }}
                            isTurn={!isFinished && currentPlayer === "BLACK"}
                            side="left"
                            username="Black"
                            elo={null}
                            avatarUrl={null}
                        />
                    </div>
                    <ScoreCard leftScore={blackScore} rightScore={whiteScore} />
                    <div className="flex min-w-0 flex-1 justify-end">
                        <PlayerCard
                            player={{ userId: "white", color: "WHITE", connected: true }}
                            isTurn={!isFinished && currentPlayer === "WHITE"}
                            side="right"
                            username="White"
                            elo={null}
                            avatarUrl={null}
                        />
                    </div>
                </div>

                <div className="w-full max-w-3xl">
                    <Board board={board} validMoves={validMoves} onMove={onMove} disabled={isFinished} />
                </div>

                <div role="status" className="text-center text-lg font-semibold min-h-8">
                    {isFinished
                        ? winner === "DRAW" ? "Draw!" : `${winner === "BLACK" ? "Black" : "White"} wins!`
                        : notice}
                </div>

                <div className="flex justify-center gap-2">
                    <button className="btn btn-soft btn-success" onClick={onRestart}>Restart</button>
                    <button className="btn btn-ghost" onClick={onQuit}>Back to lobby</button>
                </div>
            </div>

            {/* Panneau latéral de l'historique */}
            <div className="flex justify-center max-h-[800px] lg:justify-start">
                <div className="w-full max-w-sm h-full flex flex-col rounded-xl overflow-y-auto min-h-[400px] border border-[#3d3a36] bg-base-100 p-2">
                    <div className="border-b border-[#3d3a36] p-2 mb-2 text-xs font-semibold text-[#e8e6e3]">
                        Move History · {moveHistory.length}
                    </div>
                    <History
                        history={formattedHistory}
                        leftColor="BLACK"
                        showLatestFirst={showLatestFirst}
                        onReverse={() => setShowLatestFirst((prev) => !prev)}
                    />
                </div>
            </div>
        </div>
    );
};

export default LocalGame;