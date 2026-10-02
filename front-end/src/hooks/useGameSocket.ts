import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuthContext } from "./useAuthContext";
import type { GameResult, GameState, GameStatus, Move, PlayerColor, ServerCell } from "../types/gameTypes";

export interface UseGameSocketResult {
  socket: Socket | null;
  gameId: string | null;
  isConnected: boolean;
  error: string | null;
  findMatch: () => void;
  waiting: string | null;
  gameState: GameState | null;
  playMove: (position: Move) => void;
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
  const [socket, setSocket] = useState<Socket | null>(null);

  function findMatch() {
    const currentSocket = socketRef.current;

    if (!isConnected || !currentSocket?.connected || !user?.id) return;
    setError(null);
    setWaiting(null);
    setGameState(null);
    currentSocket.emit("findMatch", { userId: user.id });
  }

  function playMove(position: Move) {
    const currentSocket = socketRef.current;
    if (!isConnected || !currentSocket?.connected || !user?.id || !gameState?.gameId) return;
    currentSocket.emit("playMove", { gameId: gameState.gameId, userId: user.id, move: position });
  }

  useEffect(() => {
    if (!enabled || loading || !user?.id) {
      return;
    }

    const newSocket = io(window.location.origin, {
      autoConnect: false,
      query: { userId: user?.id },
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    function onConnect() {
      setIsConnected(true);
      setError(null);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(connectionError: Error) {
      setIsConnected(false);
      setError(connectionError.message);
    }

    function onWaiting(payload: WaitingPayload) {
      setWaiting(payload.roomId);
    }

    function onFinding(data: GameState) {
      setGameState(data);
    }

    function onMoveRejected(payload: { message: string }) {
      setError(payload.message);
    }

    function onMoveApplied(payload: MoveAppliedPayload) {
      setGameState((previousGameState) => {
        if (!previousGameState || !payload.board) {
          return previousGameState;
        }

        return {
          ...previousGameState,
          cells: payload.board,
          validMoves: payload.validMove,
          currentPlayer: payload.nextPlayer ?? previousGameState.currentPlayer,
          status: payload.status ?? previousGameState.status,
          result: payload.result,
        };
      });
    }

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);

    newSocket.on("waiting", onWaiting);
    newSocket.on("matchFound", onFinding);
    newSocket.on("moveApplied", onMoveApplied);
    newSocket.on("moveRejected", onMoveRejected);

    newSocket.connect();

    return () => {
      newSocket.disconnect();
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.off("waiting", onWaiting);
      newSocket.off("matchFound", onFinding);
      newSocket.off("moveApplied", onMoveApplied);
      newSocket.off("moveRejected", onMoveRejected);
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [loading, user?.id, enabled]);

  return {
    socket,
    gameId: gameState?.gameId ?? null,
    isConnected,
    error,
    findMatch,
    waiting,
    gameState,
    playMove,
  };
}

export default useGameSocket;
