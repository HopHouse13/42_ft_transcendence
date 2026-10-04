import React from "react";
import Board from "./Board";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";
import type { Player, BoardState, Position } from "../types/gameTypes";

interface LocalGameProps {
    board: BoardState;
    currentPlayer: Player;
    validMoves: Position[];
    blackScore: number;
    whiteScore: number;
    isFinished: boolean;
    winner: Player | "DRAW" | null;
    notice: string | null;
    onMove: (pos: Position) => void;
    onRestart: () => void;
    onQuit: () => void;
}

const LocalGame = ({
    board, currentPlayer, validMoves, blackScore, whiteScore,
    isFinished, winner, notice, onMove, onRestart, onQuit,
}: LocalGameProps): React.ReactElement => (
    <div className="grid grid-cols-1 gap-4 p-4 w-full max-w-3xl">
        <div className="flex flex-row gap-4 w-full items-center">
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

        <Board board={board} validMoves={validMoves} onMove={onMove} disabled={isFinished} />

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
);

export default LocalGame;
