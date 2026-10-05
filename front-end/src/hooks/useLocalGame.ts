import { useEffect, useMemo, useState } from "react";
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

const STORAGE_KEY = "othello:local-game";

interface SavedLocalGame {
    board: BoardState;
    currentPlayer: Player;
    started: boolean;
    notice: string | null;
}

/** Relit la partie sauvegardée (null si absente ou invalide). */
export function loadSavedLocalGame(): SavedLocalGame | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;

        const data = JSON.parse(raw);
        const validBoard =
            Array.isArray(data.board) &&
            data.board.length === BOARD_SIZE * BOARD_SIZE &&
            data.board.every((c: unknown) => c === null || c === "BLACK" || c === "WHITE");
        const validPlayer = data.currentPlayer === "BLACK" || data.currentPlayer === "WHITE";

        if (!validBoard || !validPlayer || data.started !== true)
            return null;

        return {
            board: data.board,
            currentPlayer: data.currentPlayer,
            started: true,
            notice: typeof data.notice === "string" ? data.notice : null,
        };
    } catch {
        return null;
    }
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

const opponentOf = (p: Player): Player => (p === "BLACK" ? "WHITE" : "BLACK");

export function useLocalGame() {
    const [saved] = useState(loadSavedLocalGame);

    const [board, setBoard] = useState<BoardState>(() => saved?.board ?? createInitialBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Player>(saved?.currentPlayer ?? "BLACK");
    const [started, setStarted] = useState(saved?.started ?? false);
    const [notice, setNotice] = useState<string | null>(saved?.notice ?? null);

    // Sauvegarde automatique à chaque changement
    useEffect(() => {
        try {
            if (started) {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ board, currentPlayer, started, notice }),
                );
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // localStorage indisponible (navigation privée, quota...) : on ignore
        }
    }, [board, currentPlayer, started, notice]);

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
            if (hasValidMoves(nextBoard, currentPlayer)) {
                next = currentPlayer;
                message = `${opponent === "BLACK" ? "Black" : "White"} has no valid moves and passes.`;
            }
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
