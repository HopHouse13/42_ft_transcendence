import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./useAuthContext";
import type { GameState, Move } from "../types/gameTypes";

export function useBotSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isMovePending, setIsMovePending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (loading || !user?.id) return;

    // Se connecte en utilisant l'origin actuelle (proxy Vite) et l'ID de l'utilisateur
    const socket = io(window.location.origin, {
      autoConnect: false,
      query: { userId: user.id },
      withCredentials: true,
    });

    socketRef.current = socket;

    // Événements de connexion
    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsMovePending(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Événements du jeu Bot (OthelloGateway)
    socket.on("matchFound", (state: GameState) => {
      setGameState(state);
      setIsBotThinking(false);
      setError(null);
    });

    socket.on("gameState", (state: GameState) => {
      setGameState(state);
      setIsBotThinking(false);
      setIsMovePending(false);
      setError(null);
    });

    socket.on("botThinking", () => {
      setIsBotThinking(true);
    });

    socket.on("moveRejected", (payload: { message: string }) => {
      setError(payload.message);
      setIsMovePending(false);
    });

    socket.on("botError", (payload: { message: string }) => {
      setIsBotThinking(false);
      setError(payload.message);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?.id, loading]);

  // Déclencher la partie contre le bot
  const startBotGame = useCallback(() => {
    if (socketRef.current && isConnected && user?.id) {
      setError(null);
      setGameState(null);
      socketRef.current.emit("createBotGame", { userId: user.id });
    }
  }, [isConnected, user?.id]);

  // Jouer un coup
  const playMove = useCallback((move: Move) => {
    if (socketRef.current && isConnected && gameState?.gameId && user?.id) {
      setIsMovePending(true);
      socketRef.current.emit("playMove", {
        gameId: gameState.gameId,
        userId: user.id,
        move,
      });
    }
  }, [isConnected, gameState?.gameId, user?.id]);

  return { isConnected, error, gameState, isBotThinking, isMovePending, startBotGame, playMove };
  
}

export default useBotSocket;