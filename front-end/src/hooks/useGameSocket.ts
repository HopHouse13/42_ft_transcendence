import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuthContext } from "./useAuthContext";
import type { GameResult, GameState, GameStatus, Move, PlayerColor, ServerCell } from "../types/gameTypes";

export interface SocketChatMessage {
  id: string | number;
  text: string;
  senderId: string;
  author?: string;
  time?: string;
}

interface UseGameSocketResult {
    isConnected: boolean;
    error: string | null;
    socketRef: React.RefObject<Socket | null>;
    findMatch: () => void;
    startBotGame: () => void;
    waiting: string | null;
    gameState: GameState | null;
    playMove: (position: Move) => void;
    sendMessage: (text: string) => void;
    forfeit: () => void;
    chatMessages: SocketChatMessage[];
    isMovePending: boolean;
    isBotThinking: boolean;
}

interface WaitingPayload {
    roomId: string;
}

interface MoveAppliedPayload {
    valid: boolean;
    board?: ServerCell[];
    flippedCells?: Move[];
    nextPlayer?: PlayerColor;
    status?: GameStatus;
    result?: GameResult;
    reason?: string;
    validMove: Move[];
}

function useGameSocket(enabled: boolean): UseGameSocketResult {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const { user, loading } = useAuthContext();

    const [waiting, setWaiting] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isMovePending, setIsMovePending] = useState(false);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const [chatMessages, setChatMessages] = useState<SocketChatMessage[]>([]);

    // Références pour éviter les boucles joinGame et gérer les retries
    const joinedGameIdRef = useRef<string | null>(null);
    const joinRetryRef = useRef(0);

    function resetGame() {
        const socket = socketRef.current;
        if (!isConnected || !socket?.connected || !user?.id) return null;

        setError(null);
        setWaiting(null);
        setGameState(null);
        setChatMessages([]);
        setIsBotThinking(false);
        
        joinedGameIdRef.current = null;
        joinRetryRef.current = 0;
        return socket;
    }

    function findMatch() {
        const socket = resetGame();
        if (!socket || !user?.id) return;
        socket.emit("findMatch", { userId: user.id });
    }

    function startBotGame() {
        const socket = resetGame();
        if (!socket || !user?.id) return;
        socket.emit("createBotGame", { userId: user.id });
    }

    function playMove(position: Move) {
        const socket = socketRef.current;
        if (!isConnected || !socket?.connected || !user?.id || !gameState?.gameId || isMovePending) return;

        setIsMovePending(true);
        socket.emit("playMove", { gameId: gameState.gameId, userId: user.id, move: position });
    }

    function sendMessage(text: string) {
        const socket = socketRef.current;
        if (!isConnected || !socket?.connected || !gameState?.gameId) return;

        socket.emit("sendMessage", {
            gameId: gameState.gameId,
            text,
            senderId: user?.id,
        });
    }

    function forfeit() {
        const socket = socketRef.current;
        if (!isConnected || !socket?.connected || !gameState?.gameId) return;

        socket.emit("forfeit", { gameId: gameState.gameId });
    }

    useEffect(() => {
        if (!enabled || loading || !user?.id) return;

        const socket = io(window.location.origin, {
            autoConnect: false,
            query: { userId: user?.id },
            withCredentials: true,
        });
        socketRef.current = socket;

        // Fonction d'aide pour éviter d'émettre joinGame en boucle
        function joinGameRoom(gameId: string) {
            if (joinedGameIdRef.current === gameId) return;
            joinedGameIdRef.current = gameId;
            socket.emit("joinGame", { gameId });
        }

        function onConnect() {
            setIsConnected(true);
            setError(null);
        }

        function onDisconnect(reason: string) {
            joinedGameIdRef.current = null;
            setIsMovePending(false);
            setIsConnected(false);
        }

        function onConnectError(connectionError: Error) {
            setIsMovePending(false);
            setError(connectionError.message);
            setIsConnected(false);
        }

        function onWaiting(payload: WaitingPayload) {
            setWaiting(payload.roomId);
        }

        function onFinding(data: GameState) {
            setGameState(data);
            setIsBotThinking(false);
            setError(null);
            joinGameRoom(data.gameId);
        }

        function onMoveRejected(payload: { message: string }) {
            setError(payload.message);
            setIsMovePending(false);
        }

        function onMoveApplied(payload: MoveAppliedPayload) {
            setGameState((previousGameState) => {
                if (!previousGameState || !payload.board) return previousGameState;

                return {
                    ...previousGameState,
                    cells: payload.board,
                    validMoves: payload.validMove,
                    currentPlayer: payload.nextPlayer ?? previousGameState.currentPlayer,
                    status: payload.status ?? previousGameState.status,
                    result: payload.result,
                };
            });
            setIsMovePending(false);
            setError(null);
        }

        function onGameState(data: GameState) {
            setGameState(data);
            setIsBotThinking(false);
            setIsMovePending(false);
            setError(null);
            joinRetryRef.current = 0;
            joinGameRoom(data.gameId);
        }

        function onGameError(payload: { message: string }) {
            const gameId = joinedGameIdRef.current;
            if (gameId && joinRetryRef.current < 2 && /introuvable|not found/i.test(payload.message)) {
                joinRetryRef.current++;
                setTimeout(() => socket.emit("joinGame", { gameId }), 300);
                return;
            }
            setError(payload.message);
        }

        function onBotThinking() {
            setIsBotThinking(true);
        }

        function onBotError(payload: { message: string }) {
            setIsBotThinking(false);
            setError(payload.message);
        }

        function onAllMessages(history: SocketChatMessage[]) {
            setChatMessages(history);
        }

        function onNewMessage(message: SocketChatMessage) {
            setChatMessages((prev) => [...prev, message]);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);

        socket.on("waiting", onWaiting);
        socket.on("matchFound", onFinding);
        socket.on("moveApplied", onMoveApplied);
        socket.on("moveRejected", onMoveRejected);
        socket.on("gameState", onGameState);
        socket.on("gameError", onGameError);
        socket.on("botThinking", onBotThinking);
        socket.on("botError", onBotError);

        socket.on("allMessages", onAllMessages);
        socket.on("newMessage", onNewMessage);

        socket.connect();

        return () => {
            socket.disconnect();
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.off("waiting", onWaiting);
            socket.off("matchFound", onFinding);
            socket.off("moveApplied", onMoveApplied);
            socket.off("moveRejected", onMoveRejected);
            socket.off("gameState", onGameState);
            socket.off("gameError", onGameError);
            socket.off("botThinking", onBotThinking);
            socket.off("botError", onBotError);
            socket.off("allMessages", onAllMessages);
            socket.off("newMessage", onNewMessage);

            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [loading, user?.id, enabled]);

    return {
        isConnected,
        error,
        socketRef,
        findMatch,
        startBotGame,
        waiting,
        gameState,
        playMove,
        sendMessage,
        forfeit,
        chatMessages,
        isMovePending,
        isBotThinking,
    };
}

export default useGameSocket;