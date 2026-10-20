import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthSession } from "./useAuthSession";
import type { GameState, Move } from "../types/gameTypes";

const LOCAL_GAME_KEY = "othello_local_game_id";

export function useLocalSocket() {
  const [isConnected, setIsConnected] = useState(false);
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

      // 🔄 AU CHARGEMENT / RECO S'IL Y A UN GAME_ID SAUVEGARDÉ :
      const savedGameId = localStorage.getItem(LOCAL_GAME_KEY);
      if (savedGameId) {
        console.log("🔄 Partie trouvée dans le localStorage, récupération de l'état :", savedGameId);
        socket.emit("getGameState", { gameId: savedGameId });
      }else{
        console.log(" Partie non trouvée dans le localStorage");

        // Demande au serveur de récupérer l'état de cette partie
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

    // Événement à la création d'une nouvelle partie locale
    socket.on("events", (gameId: string) => {
      localStorage.setItem(LOCAL_GAME_KEY, gameId); // Sauvegarde
      setGameState((prev) => ({ ...(prev || {}), gameId } as GameState));
      setError(null);
    });

    socket.on("gameState", (state: GameState) => {
      // Si l'état contient un gameId, on le sauvegarde aussi
      if (state.gameId) {
        localStorage.setItem(LOCAL_GAME_KEY, state.gameId);
      }
      setGameState((prev) => ({
        ...state,
        gameId: state.gameId ?? prev?.gameId ?? localStorage.getItem(LOCAL_GAME_KEY) ?? undefined,
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
      setIsMovePending(false);
      // Si le jeu n'existe plus sur le serveur (ex: nettoyé de la Map), on nettoie le storage
      localStorage.removeItem(LOCAL_GAME_KEY);
      setGameState(null);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user?.id, loading]);

  const startLocalGame = useCallback(() => {
    if (socketRef.current && isConnected && user?.id) {
      setError(null);
      setGameState(null);
      localStorage.removeItem(LOCAL_GAME_KEY); // Nettoyage de l'ancienne partie
      socketRef.current.emit("crateLocal");
    }
  }, [isConnected, user?.id]);

  const playMove = useCallback((move: Move) => {
    const currentStorageGameId = localStorage.getItem(LOCAL_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId) {
      setIsMovePending(true);
      socketRef.current.emit("localplayMove", {
        gameId: targetGameId,
        move,
      });
    }
  }, [isConnected, gameState?.gameId]);

  // Fonction pour quitter ou effacer la partie terminée
  const clearFinishedGame = useCallback(() => {
    localStorage.removeItem(LOCAL_GAME_KEY);
    setGameState(null);
  }, []);

  const giveUp = useCallback((color: string) => {
    const currentStorageGameId = localStorage.getItem(LOCAL_GAME_KEY);
    const targetGameId = gameState?.gameId || currentStorageGameId;

    if (socketRef.current && isConnected && targetGameId) {
      socketRef.current.emit("localGiveUp", {
        gameId: targetGameId,
        color,
      });
    }
  }, [isConnected, gameState?.gameId]);

  // N'oubliez pas de l'inclure dans le return du hook
  return { isConnected, error, gameState, isMovePending, startLocalGame, playMove, giveUp };

}

export default useLocalSocket;