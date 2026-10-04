import { useMemo, useState } from "react";
import type { BoardState, Player, Position } from "../types/gameTypes";
import { BOARD_SIZE } from "../constants/gameConstants";
import {
    flipCells,
    getAllValidMoves,
    getCellCount,
    getIndex,
    hasValidMoves,
    isValidMove,
} from "../logic/gameLogic";

function createInitialBoard(): BoardState {
    const board: BoardState = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    const mid = BOARD_SIZE / 2;
    board[getIndex({ row: mid - 1, col: mid - 1 })] = "WHITE";
    board[getIndex({ row: mid - 1, col: mid })] = "BLACK";
    board[getIndex({ row: mid, col: mid - 1 })] = "BLACK";
    board[getIndex({ row: mid, col: mid })] = "WHITE";
    return board;
}

const opponentOf = (p: Player): Player => (p === "BLACK" ? "WHITE" : "BLACK");

export function useLocalGame() {
    const [board, setBoard] = useState<BoardState>(createInitialBoard);
    const [currentPlayer, setCurrentPlayer] = useState<Player>("BLACK");
    const [started, setStarted] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const validMoves = useMemo(
        () => getAllValidMoves(board, currentPlayer),
        [board, currentPlayer],
    );

    const blackScore = getCellCount(board, "BLACK");
    const whiteScore = getCellCount(board, "WHITE");

    const isFinished =
        started &&
        validMoves.length === 0 &&
        !hasValidMoves(board, opponentOf(currentPlayer));

    const winner: Player | "DRAW" | null = !isFinished
        ? null
        : blackScore > whiteScore
            ? "BLACK"
            : whiteScore > blackScore
                ? "WHITE"
                : "DRAW";

    function start() {
        setBoard(createInitialBoard());
        setCurrentPlayer("BLACK");
        setNotice(null);
        setStarted(true);
    }

    function quit() {
        setStarted(false);
        setNotice(null);
    }

    function playMove(pos: Position) {
        if (!started || isFinished || !isValidMove(board, pos, currentPlayer))
            return;

        const nextBoard = [...board];
        nextBoard[getIndex(pos)] = currentPlayer;
        flipCells(nextBoard, pos, currentPlayer);

        const opponent = opponentOf(currentPlayer);
        let next = opponent;
        let message: string | null = null;

        if (!hasValidMoves(nextBoard, opponent)) {
            // L'adversaire passe son tour si le joueur courant peut encore jouer
            if (hasValidMoves(nextBoard, currentPlayer)) {
                next = currentPlayer;
                message = `${opponent === "BLACK" ? "Black" : "White"} has no valid moves and passes.`;
            }
            // sinon : fin de partie (détectée par isFinished)
        }

        setBoard(nextBoard);
        setCurrentPlayer(next);
        setNotice(message);
    }

    return {
        started, board, currentPlayer, validMoves,
        blackScore, whiteScore, isFinished, winner, notice,
        start, quit, playMove,
    };
}
