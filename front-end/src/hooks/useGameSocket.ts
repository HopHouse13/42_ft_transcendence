import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuthContext } from "./useAuthContext";
import type { GameResult, GameState, GameStatus, Move, PlayerColor, ServerCell } from "../types/gameTypes";


interface UseGameSocketResult {
	isConnected: boolean;
	error: string | null;
	socketRef: React.RefObject<Socket | null>;
	findMatch: () => void;
	waiting: string | null;
	gameState: GameState | null;
	playMove: (position: Move) => void;
}

interface WaitingPayload{
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
    validMove: Move[],
}

function useGameSocket(enabled: boolean): UseGameSocketResult {
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const { user, loading } = useAuthContext();

	const [waiting , setWaiting] = useState<string | null>(null);
	const [gameState, setGameState] =useState<GameState | null>(null);

	function findMatch() {
		const socket = socketRef.current;

		if (!isConnected || !socket?.connected || !user?.id )
			return;
		setError(null);
		setWaiting(null);
		setGameState(null);
		socket.emit("findMatch", {userId: user.id})
	};

	function playMove(position: Move) {
		const socket = socketRef.current;
		if (!isConnected || !socket?.connected || !user?.id || !gameState?.gameId)
			return;
		socket.emit("playMove", {gameId: gameState.gameId, userId: user.id, move: position})
	}

	useEffect(() => {
		if (!enabled || loading || !user?.id) {
			return;
		}

		const socket = io(window.location.origin, {
			autoConnect: false,
			query: {userId: user?.id},
			withCredentials: true,
		});
		socketRef.current = socket;

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

		function onMoveRejected(payload: {message: string}) {
			setError(payload.message);
		}

		// function onMoveApplied(data: GameState) {
			// setGameState(data);
		function onMoveApplied(payload: MoveAppliedPayload) {
			setGameState((previousGameState) => {
				if (!previousGameState || !payload.board){
					return previousGameState;
				}

				return {
					...previousGameState,
					cells: payload.board,
                    validMoves: payload.validMove,
					currentPlayer: payload.nextPlayer ?? previousGameState.currentPlayer,
					status: payload.status ?? previousGameState.status,
					result: payload.result,
				}
			})
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("connect_error", onConnectError);

		socket.on("waiting", onWaiting);
		socket.on("matchFound", onFinding);
		socket.on("moveApplied", onMoveApplied)
		socket.on("moveRejected", onMoveRejected )

		socket.connect();

		return () => {
			socket.disconnect();
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("connect_error", onConnectError);
			socket.off("waiting", onWaiting);
			socket.off("matchFound", onFinding);
			socket.off("moveApplied", onMoveApplied)
			socket.off("moveRejected", onMoveRejected )
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
		waiting,
		gameState,
		playMove
	};
}

export default useGameSocket;
