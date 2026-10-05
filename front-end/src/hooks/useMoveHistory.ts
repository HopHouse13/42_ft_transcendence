import { useState } from "react";
import type { GameState, MoveHistoryEntry, Player, Position } from "../types/gameTypes";
import { toClientCell } from "../utils/cellConverter";
import { BOARD_SIZE, TOTAL_CELLS } from "../constants/gameConstants";

interface UseMoveHistoryResult {
	/** Historique des coups (index 0 = état initial du plateau) */
	history: MoveHistoryEntry[];
	/** Index du dernier coup de l'historique */
	latestMove: number;
	/** Ordre d'affichage : true = plus récent en premier */
	showLatestFirst: boolean;
	/** Inverse l'ordre d'affichage de l'historique */
	toggleOrder: () => void;
}

interface MoveHistoryState {
	/** Dernier état du jeu déjà intégré à l'historique */
	processedGameState: GameState | null;
	gameId: string | null;
	history: MoveHistoryEntry[];
	lastCurrentPlayer: Player | null;
}

const INITIAL_STATE: MoveHistoryState = {
	processedGameState: null,
	gameId: null,
	history: [],
	lastCurrentPlayer: null,
};

/**
 * Compare deux plateaux et extrait les informations du coup joué.
 *
 * @param prevBoard - État du plateau avant le coup
 * @param nextBoard - État du plateau après le coup
 * @returns La position du pion posé, le joueur qui a joué et le nombre de pions retournés
 */
function extractMove(prevBoard: (Player | null)[], nextBoard: (Player | null)[]): {
	position: Position | null;
	player: Player | null;
	flippedCount: number;
} {
	let position: Position | null = null;
	let player: Player | null = null;
	let flippedCount = 0;

	for (let index = 0; index < TOTAL_CELLS; index++) {
		if (prevBoard[index] === nextBoard[index])
			continue;
		if (prevBoard[index] === null && nextBoard[index] !== null && position === null) {
			position = {
				row: Math.floor(index / BOARD_SIZE),
				col: index % BOARD_SIZE,
			};
			player = nextBoard[index];
		} else {
			flippedCount++;
		}
	}
	return { position, player, flippedCount };
}

/**
 * Intègre un nouvel état du jeu dans l'historique (pur : ne lit que ses arguments).
 *
 * @param previous - État interne du hook avant l'intégration
 * @param gameState - Nouvel état du jeu envoyé par le serveur (null hors partie)
 * @returns Le nouvel état interne du hook
 */
function computeNextState(previous: MoveHistoryState, gameState: GameState | null): MoveHistoryState {
	// Retour au lobby : réinitialise l'historique
	if (!gameState)
		return (INITIAL_STATE);

	const board = gameState.cells.map(toClientCell);

	// Nouvelle partie : réinitialise l'historique avec l'état initial du plateau
	if (previous.gameId !== gameState.gameId) {
		return {
			processedGameState: gameState,
			gameId: gameState.gameId,
			history: [{
				board,
				player: null,
				position: null,
				flippedCount: 0,
				passed: false,
			}],
			lastCurrentPlayer: gameState.currentPlayer,
		};
	}

	const lastEntry = previous.history[previous.history.length - 1];
	const sameBoard = lastEntry.board.every((cell, index) => cell === board[index]);

	// Passe : le joueur courant change mais le plateau est inchangé
	if (sameBoard) {
		if (gameState.currentPlayer !== previous.lastCurrentPlayer && previous.lastCurrentPlayer) {
			return {
				...previous,
				processedGameState: gameState,
				history: [
					...previous.history,
					{
						board: lastEntry.board,
						player: previous.lastCurrentPlayer,
						position: null,
						flippedCount: 0,
						passed: true,
					},
				],
				lastCurrentPlayer: gameState.currentPlayer,
			};
		}
		return ({ ...previous, processedGameState: gameState });
	}

	// Coup joué : extraction de la position posée et des pions retournés
	const { position, player, flippedCount } = extractMove(lastEntry.board, board);

	// Passe implicite : le même joueur enchaîne deux coups, l'adversaire n'a pas pu jouer
	if (player && lastEntry.player === player) {
		const passedPlayer: Player = player === 'BLACK' ? 'WHITE' : 'BLACK';
		return {
			...previous,
			processedGameState: gameState,
			history: [
				...previous.history,
				{
					board: lastEntry.board,
					player: passedPlayer,
					position: null,
					flippedCount: 0,
					passed: true,
				},
				{
					board,
					player,
					position,
					flippedCount,
					passed: false,
				},
			],
			lastCurrentPlayer: gameState.currentPlayer,
		};
	}

	return {
		...previous,
		processedGameState: gameState,
		history: [
			...previous.history,
			{
				board,
				player,
				position,
				flippedCount,
				passed: false,
			},
		],
		lastCurrentPlayer: gameState.currentPlayer,
	};
}

/**
 * Construit et gère l'historique des coups d'une partie à partir des états du jeu
 * envoyés par le serveur.
 *
 * Fonctionnalités :
 * - Enregistre l'état initial du plateau à la création de la partie.
 * - Détecte chaque coup joué en comparant le nouveau plateau au précédent
 *   (position posée, joueur, pions retournés).
 * - Détecte les passes : changement de joueur courant sans modification du plateau,
 *   ou même joueur qui enchaîne deux coups (passe implicite de l'adversaire).
 * - Permet d'inverser l'ordre d'affichage.
 * - Se réinitialise automatiquement au changement de partie.
 *
 * @param gameState - État actuel du jeu envoyé par le serveur (null hors partie)
 */
function useMoveHistory(gameState: GameState | null): UseMoveHistoryResult {
	const [state, setState] = useState<MoveHistoryState>(INITIAL_STATE);
	const [showLatestFirst, setShowLatestFirst] = useState<boolean>(false);

	// Ajuste l'état pendant le rendu lorsqu'un nouvel état du jeu arrive (pattern React
	// officiel "adjust state when a prop changes", évite un effet avec setState).
	if (gameState !== state.processedGameState) {
		setState((previous) => computeNextState(previous, gameState));
	}

	function toggleOrder(): void {
		setShowLatestFirst((previous) => !previous);
	}

	const latestMove = state.history.length - 1;

	return {
		history: state.history,
		latestMove,
		showLatestFirst,
		toggleOrder,
	};
}

export default useMoveHistory;
