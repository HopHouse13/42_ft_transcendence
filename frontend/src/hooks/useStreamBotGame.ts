import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthSession } from "./useAuthSession";
import type { GameState } from "../types/gameTypes";

const STREAM_GAME_KEY = "othello_stream_game_id";

export function useStreamBotGame() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);

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

      // Récupération automatique si un stream_game_id est en cache (F5)
      const savedGameId = localStorage.getItem(STREAM_GAME_KEY);
      if (savedGameId) {
        socket.emit("getGameState", { gameId: savedGameId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsBotThinking(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Réception des états de jeu en direct pour le stream
    socket.on("gameState", (state: GameState) => {
      if (state.gameId) localStorage.setItem(STREAM_GAME_KEY, state.gameId);
      setGameState((prev) => ({
        ...state,
        gameId: state.gameId ?? prev?.gameId ?? localStorage.getItem(STREAM_GAME_KEY) ?? undefined,
      }));
      setIsBotThinking(false);
      setError(null);
    });

    socket.on("botThinking", () => {
      setIsBotThinking(true);
    });

    socket.on("gameError", (payload: { message: string }) => {
      setError(payload.message);
      setIsBotThinking(false);
      localStorage.removeItem(STREAM_GAME_KEY);
      setGameState(null);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?.id, loading]);

  // Lancer une partie en streaming (Bot vs Bot)
  const startStreamGame = useCallback(() => {
    if (socketRef.current && isConnected && user?.id) {
      setError(null);
      setGameState(null);
      localStorage.removeItem(STREAM_GAME_KEY);
      // Événement déclenchant le match Bot vs Bot côté back
      socketRef.current.emit("createBotStreamGame"); 
    }
  }, [isConnected, user?.id]);

  return { isConnected, error, gameState, isBotThinking, startStreamGame };
}

export default useStreamBotGame;