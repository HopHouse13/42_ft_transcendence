import { BoardState, Position, Direction, Player, Pawn } from "../types/gameTypes";
import { BOARD_SIZE, DIRECTIONS, TOTAL_CELLS } from "../constants/gameConstants";

/**
 * Compte le nombre de pions d'un type donné sur le plateau.
 *
 * @param board - Le plateau de jeu (tableau 1D de 64 éléments)
 * @param pawn - Le pion à compter ('X' pour les noirs, 'O' pour les blancs)
 * @returns Le nombre de pions du joueur donné sur le plateau
 */
export function getPawnCount(board: BoardState, pawn: Player): number {
	return (board.filter((s: Pawn) => s === pawn).length);
}

/**
 * Convertit une position 2D (ligne, colonne) en index linéaire.
 * Permet d'accéder directement à une case du plateau stocké en tableau 1D.
 *
 * @param position - La position 2D à convertir (objet avec row et col)
 * @returns L'index linéaire correspondant (0 à TOTAL_CELLS-1)
 *
 * @example
 * getIndex({ row: 3, col: 3 }) // → 27 (pour BOARD_SIZE=8)
 * getIndex({ row: 4, col: 4 }) // → 36
 */
export function getIndex(position: Position): number {
	return (position.row * BOARD_SIZE + position.col);
}

/**
 * Convertit un index linéaire en position 2D (ligne, colonne).
 * Permet de manipuler une case avec des coordonnées lisibles.
 *
 * @param index - L'index linéaire dans le tableau (0 à TOTAL_CELLS-1)
 * @returns La position 2D correspondante (objet avec row et col)
 *
 * @example
 * getPosition(27) // → { row: 3, col: 3 }
 * getPosition(36) // → { row: 4, col: 4 }
 */
export function getPosition(index: number): Position {
	return {
		row: Math.floor(index / BOARD_SIZE),
		col: index % BOARD_SIZE
	};
}

/**
 * Vérifie si une position est située sur le plateau de jeu.
 * Une position est valide si ses coordonnées sont comprises entre 0 (inclus) et BOARD_SIZE (exclus).
 *
 * @param pos - La position à vérifier (objet avec row et col)
 * @returns true si la position est sur le plateau, false sinon
 */
export function isOnBoard(pos: Position): boolean {
	return (
		pos.row >= 0 && pos.row < BOARD_SIZE &&
		pos.col >= 0 && pos.col < BOARD_SIZE
	);
}

/**
 * Trouve toutes les positions des pions adverses qui seraient retournés si on joue à une position donnée.
 *
 * Algorithme :
 * 1. Pour chaque direction (8 directions possibles), parcourt les cases successives
 * 2. Accumule les positions contenant des pions adverses
 * 3. Si un pion du joueur actuel est trouvé à la fin de la séquence, tous les pions accumulés sont retournables
 *
 * @param board - État actuel du plateau
 * @param newPawnPos - Position où le joueur veut poser son pion
 * @param currentPlayer - Joueur actuel ('X' ou 'O')
 * @returns Tableau des positions des pions à retourner
 */
export function getFlippedPawns(board: BoardState, newPawnPos: Position, currentPlayer: Player): Position[] {
	const flipped: Position[] = [];

	for (const [dr, dc] of DIRECTIONS) {
		let checkedPos: Position = { ...newPawnPos };
		checkedPos.row += dr;
		checkedPos.col += dc;
		let toFlipInDirection: Position[] = [];

		// Parcourt la direction tant qu'on trouve des pions adverses (non vides)
		while (isOnBoard(checkedPos) &&
				board[getIndex(checkedPos)] !== currentPlayer &&
				board[getIndex(checkedPos)] !== null) {
			toFlipInDirection.push({ ...checkedPos });
			checkedPos.row += dr;
			checkedPos.col += dc;
		}

		// Si on trouve un pion du joueur actuel à la fin, les pions intermédiaires sont valides
		if (isOnBoard(checkedPos) &&
			board[getIndex(checkedPos)] === currentPlayer) {
			flipped.push(...toFlipInDirection);
		}
	}
	return flipped;
}

/**
 * Vérifie si un coup est valide pour le joueur actuel à une position donnée.
 *
 * Un coup est valide si :
 * - La case est vide (null)
 * - Le coup permettrait de retourner au moins un pion adverse
 *
 * @param board - État actuel du plateau
 * @param pos - Position à vérifier
 * @param currentPlayer - Joueur actuel ('X' ou 'O')
 * @returns true si le coup est valide, false sinon
 */
export function isValidMove(board: BoardState, pos: Position, currentPlayer: Player): boolean {
	if (board[getIndex(pos)] !== null)
		return (false);
	return (getFlippedPawns(board, pos, currentPlayer).length > 0);
}

/**
 * Vérifie si le joueur actuel a au moins un coup valide sur l'ensemble du plateau.
 * Parcourt toutes les cases du plateau pour trouver un coup valide.
 *
 * @param board - État actuel du plateau
 * @param currentPlayer - Joueur actuel ('X' ou 'O')
 * @returns true si le joueur a au moins un coup valide, false sinon
 */
export function hasValidMoves(board: BoardState, currentPlayer: Player): boolean {
	for (let row = 0; row < BOARD_SIZE; row++) {
		for (let col = 0; col < BOARD_SIZE; col++) {
			let checkedPos: Position = { row, col };
			if (isValidMove(board, checkedPos, currentPlayer))
				return (true);
		}
	}
	return (false);
}

/**
 * Retourne effectivement les pions adverses après un coup valide.
 * Modifie directement le plateau passé en paramètre.
 *
 * @param nextBoard - Nouveau état du plateau (sera modifié)
 * @param newPawnPos - Position où le coup a été joué
 * @param currentPlayer - Joueur qui a joué ('X' ou 'O')
 * @returns true si des pions ont été retournés, false sinon
 */
export function flipPawns(nextBoard: BoardState, newPawnPos: Position, currentPlayer: Player): boolean {
	const flipped = getFlippedPawns(nextBoard, newPawnPos, currentPlayer);
	for (const pos of flipped) {
		nextBoard[getIndex(pos)] = currentPlayer;
	}
	return (flipped.length > 0);
}

/**
 * Trouve toutes les positions où le joueur actuel peut jouer un coup valide.
 * Utilisé pour mettre en surbrillance les coups possibles dans l'UI.
 *
 * @param board - État actuel du plateau
 * @param currentPlayer - Joueur actuel ('X' ou 'O')
 * @returns Tableau de toutes les positions valides
 */
export function getAllValidMoves(board: BoardState, currentPlayer: Player): Position[] {
	const validMoves: Position[] = [];
	for (let row = 0; row < BOARD_SIZE; row++) {
		for (let col = 0; col < BOARD_SIZE; col++) {
			let checkedPos: Position = { row, col };
			if (isValidMove(board, checkedPos, currentPlayer))
				validMoves.push({ ...checkedPos });
		}
	}
	return (validMoves);
}

/**
 * Génère une description textuelle d'un coup pour l'historique.
 * Convertit l'index en coordonnées 1-indexées pour un affichage lisible.
 *
 * @param history - Historique complet des plateaux
 * @param move - Numéro du coup (0 pour le début, 1+ pour les coups suivants)
 * @returns Description du coup au format "Go to game start" ou "#2 Black played [4, 5]"
 */
export function getMoveDescription(history: BoardState[], move: number): string {
	if (move < 1) {
		return ("Go to game start");
	}

	const newBoard = history[move];
	const prevBoard = history[move - 1];
	const player = move % 2 === 1 ? "Black" : "White";

	let newPawnIndex = -1;
	for (let i = 0; i < TOTAL_CELLS; i++) {
		if (newBoard[i] !== prevBoard[i]) {
			newPawnIndex = i;
			break;
		}
	}
	if (newPawnIndex < 0) {
		return (`#${move} ${player} passed.`);
	}

	return (`#${move} ${player} played [${getPosition(newPawnIndex).row + 1}, ${getPosition(newPawnIndex).col + 1}]`);
}

/**
 * Génère le texte de statut du jeu (score, tour actuel, résultat).
 *
 * @param board - État actuel du plateau
 * @param xIsNext - true si c'est au tour des noirs (X), false pour les blancs (O)
 * @param currentPlayerHasMoves - true si le joueur actuel a des coups valides
 * @param opponentsHasMoves - true si l'adversaire a des coups valides
 * @returns Texte de statut formaté avec score, tour actuel et résultat
 */
export function getStatusText(board: BoardState, xIsNext: boolean, currentPlayerHasMoves: boolean, opponentsHasMoves: boolean): string {
	const blackCount = getPawnCount(board, 'X');
	const whiteCount = getPawnCount(board, 'O');
	let status: string = "";
	let score: string = "";
	let result: string = "";

	score = `Black: ${blackCount} | White: ${whiteCount}`;
	if (!currentPlayerHasMoves) {
		if (!opponentsHasMoves) {
			status += `Game Over !`;
			if (blackCount > whiteCount)
				result = ` Black wins!`;
			if (blackCount < whiteCount)
				result += ` White wins!`;
			if (blackCount === whiteCount)
				result += ` Draw!`;
		} else {
			status = `${xIsNext ? "Black" : "White"} has no valid moves.`;
		}
	} else {
		status = `Next player: ${xIsNext ? "Black" : "White"}`;
	}

	return (`${score} | ${status} ${result}`);
}
