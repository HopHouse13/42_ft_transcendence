import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthSession } from "./useAuthSession";
import type { GameState, Move } from "../types/gameTypes";
import { useToast } from "./useToast";

const BOT_GAME_KEY = "othello_bot_game_id";

export function useBotSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isMovePending, setIsMovePending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const { user, loading } = useAuthSession();
  const toast = useToast();

  useEffect(() => {
    if (loading || !user?.id) return;

    // Se connecte en utilisant l'origin actuelle et l'ID de l'utilisateur
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

      // 🔄 Récupération automatique si un gameId est en cache (F5)
      const savedGameId = localStorage.getItem(BOT_GAME_KEY);
      if (savedGameId) {
        socket.emit("getGameState", { gameId: savedGameId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsMovePending(false);
      setIsBotThinking(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Événements du jeu Bot
    socket.on("matchFound", (state: GameState) => {
      if (state.gameId) localStorage.setItem(BOT_GAME_KEY, state.gameId);
      setGameState(state);
      setIsBotThinking(false);
      setError(null);
    });

    socket.on("gameState", (state: GameState) => {
      if (state.gameId) localStorage.setItem(BOT_GAME_KEY, state.gameId);
      setGameState((prev) => ({
        ...state,
        gameId: state.gameId ?? prev?.gameId ?? localStorage.getItem(BOT_GAME_KEY) ?? undefined,
      }));
      setIsBotThinking(false);
      setIsMovePending(false);
      setError(null);
    });

    socket.on("botThinking", () => {
      setIsBotThinking(true);
    });

    socket.on("moveRejected", (payload: { message: string }) => {
      toast.error(payload.message);
      setIsMovePending(false);
      setIsBotThinking(false);
    });

    socket.on("botError", (payload: { message: string }) => {
      setIsBotThinking(false);
      setError(payload.message);
    });

    socket.on("gameError", (payload: { message: string }) => {
      setError(payload.message);
      setIsBotThinking(false);
      setIsMovePending(false);
      localStorage.removeItem(BOT_GAME_KEY);
      setGameState(null);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?.id, loading]);

  // Déclencher la partie contre le bot avec la couleur choisie
  const startBotGame = useCallback((color: "BLACK" | "WHITE" = "BLACK") => {
    if (socketRef.current && isConnected && user?.id) {
      setError(null);
      setGameState(null);
      localStorage.removeItem(BOT_GAME_KEY);
      socketRef.current.emit("createBotGame", { color }); // 👈 Envoi de la couleur sélectionnée
    }
  }, [isConnected, user?.id]);

  // Jouer un coup (envoie vers l'événement computePlayMove de notre service)
  const playMove = useCallback((move: Move) => {
    const currentStorageGameId = localStorage.getItem(BOT_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId && user?.id) {
      setIsMovePending(true);
      setIsBotThinking(true);
      socketRef.current.emit("computePlayMove", {
        gameId: targetGameId,
        move,
      });
    }
  }, [isConnected, gameState?.gameId, user?.id]);

  const giveUp = useCallback(() => {
    const currentStorageGameId = localStorage.getItem(BOT_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId) {
      socketRef.current.emit("botGiveUp", { gameId: targetGameId });
    }
  }, [isConnected, gameState?.gameId]);

  return { isConnected, error, gameState, isMovePending, startBotGame, playMove, giveUp };
}

export default useBotSocket;