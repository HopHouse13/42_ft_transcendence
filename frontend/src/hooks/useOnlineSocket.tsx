import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthSession } from "./useAuthSession";
import type { GameState, Move } from "../types/gameTypes";

const ONLINE_GAME_KEY = "othello_online_game_id";

export function useOnlineSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isMovePending, setIsMovePending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const { user, loading } = useAuthSession();

  useEffect(() => {
    if (loading || !user?.id) return;

    const socket = io(window.location.origin, {
      autoConnect: false,
      query: { userId: user.id },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);

      // Reprise de partie en cas de F5
      const savedGameId = localStorage.getItem(ONLINE_GAME_KEY);
      if (savedGameId) {
        socket.emit("getGameState", { gameId: savedGameId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsMovePending(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    socket.on("waitingForOpponent", () => {
      setIsWaiting(true);
      setError(null);
    });

    socket.on("matchFound", (state: GameState) => {
      if (state.gameId) {
        localStorage.setItem(ONLINE_GAME_KEY, state.gameId);
      }
      setIsWaiting(false);
      setGameState(state);
      setError(null);
    });

    socket.on("gameState", (state: GameState) => {
      if (state.gameId) {
        localStorage.setItem(ONLINE_GAME_KEY, state.gameId);
      }
      setGameState((prev) => ({
        ...state,
        gameId: state.gameId ?? prev?.gameId ?? localStorage.getItem(ONLINE_GAME_KEY) ?? undefined,
      }));
      setIsMovePending(false);
      setError(null);
    });

    socket.on("moveRejected", (payload: { message: string }) => {
      setError(payload.message);
      setIsMovePending(false);
    });

    socket.on("gameError", (payload: { message: string }) => {
      setError(payload.message);
      setIsWaiting(false);
      setIsMovePending(false);
      localStorage.removeItem(ONLINE_GAME_KEY);
      setGameState(null);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?.id, loading]);

  const joinQueue = useCallback((color?: "BLACK" | "WHITE") => {
    if (socketRef.current && isConnected && user?.id) {
      setError(null);
      setGameState(null);
      setIsWaiting(true);
      localStorage.removeItem(ONLINE_GAME_KEY);
      socketRef.current.emit("joinOnlineQueue", { color });
    }
  }, [isConnected, user?.id]);

  const playMove = useCallback((move: Move) => {
    const currentStorageGameId = localStorage.getItem(ONLINE_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId) {
      setIsMovePending(true);
      socketRef.current.emit("onlinePlayMove", {
        gameId: targetGameId,
        move,
      });
    }
  }, [isConnected, gameState?.gameId]);

  const giveUp = useCallback(() => {
    const currentStorageGameId = localStorage.getItem(ONLINE_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId) {
      socketRef.current.emit("onlineGiveUp", { gameId: targetGameId });
    }
  }, [isConnected, gameState?.gameId]);

  return { isConnected, isWaiting, error, gameState, isMovePending, joinQueue, playMove, giveUp };
}

export default useOnlineSocket;