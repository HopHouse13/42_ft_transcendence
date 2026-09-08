import React from "react";
import { BoardProps, Player, BoardState, Position } from "../types/gameTypes";
import Square from "./Square";
import StatusBar from "./StatusBar";
import { hasValidMoves, getAllValidMoves, isValidMove, flipPawns, getIndex } from "../logic/gameLogic";

/**
 * Composant Board - Gère le plateau de jeu Othello/Reversi.
 *
 * Responsabilités :
 * - Rend le plateau 8x8 avec les pions et les coups valides.
 * - Gère les clics sur les cases (validation des coups, retournement des pions).
 * - Affiche la barre de statut et le bouton "Pass" si nécessaire.
 *
 * @param xIsNext - True si c'est au tour du joueur 'X' (noir), false pour 'O' (blanc).
 * @param board - État actuel du plateau (tableau 1D de 64 cases).
 * @param onPlay - Callback appelée après un coup valide pour mettre à jour l'état du jeu.
 */
export default function Board({xIsNext, board, onPlay}: BoardProps): React.ReactElement {
	// Détermine le joueur actuel ('X' pour noir, 'O' pour blanc)
	const currentPlayer: Player = xIsNext ? 'X' : 'O';

	// Récupère toutes les positions où le joueur actuel peut jouer
	const validMoves = getAllValidMoves(board, currentPlayer);

	// Vérifie si le joueur actuel a au moins un coup valide
	const currentPlayerHasMoves = validMoves.length > 0;

	// Détermine l'adversaire
	const opponent: Player = xIsNext ? 'O' : 'X';

	// Vérifie si l'adversaire a des coups valides (pour gérer le passage de tour)
	const opponentHasMoves = hasValidMoves(board, opponent);

	/**
	 * Gère un clic sur une case du plateau.
	 * Valide le coup, retourne les pions si nécessaire, et déclenche onPlay.
	 *
	 * @param pos - Position {row, col} de la case cliquée.
	 */
	function handleClick(pos: Position): void {
		// Ignore si la case est déjà occupée
		if (board[getIndex(pos)] !== null)
			return;

		// Ignore si le coup n'est pas valide selon les règles du jeu
		if (!isValidMove(board, pos, currentPlayer))
			return;

		// Crée une copie du plateau pour éviter de modifier l'état directement
		const nextBoard: BoardState = board.slice();

		// Place le pion du joueur actuel
		nextBoard[getIndex(pos)] = currentPlayer;

		// Retourne les pions adverses et vérifie si au moins un pion a été retourné
		const flipped = flipPawns(nextBoard, pos, currentPlayer);
		if (!flipped)
				return; // Si aucun pion retourné, le coup est invalide (ne devrait pas arriver si isValidMove est correct)

		// Transmet le nouvel état du plateau au parent via onPlay
		onPlay(nextBoard);
	}

	/**
	 * Génère la structure JSX du plateau 8x8.
	 * Crée une grille de composants Square avec les pions, les coups valides, et les gestionnaires de clic.
	 *
	 * @returns JSX.Element - La grille complète du plateau.
	 */
	const renderBoard = (): JSX.Element => {
		return (
			<>
				{Array(8).fill(null).map((_, row: number) => (
					<div className="board-row" key={row}>
						{Array(8).fill(null).map((_, col: number) => {
							// Convertit les coordonnées (row, col) en objet Position
							const cellPos = {row, col};
							return (
								<Square 
									key={getIndex(cellPos)} // Clé unique pour chaque case
									value={board[getIndex(cellPos)]} // Valeur de la case : 'X', 'O', ou null
									onSquareClick={() => handleClick(cellPos)} // Gestionnaire de clic avec la position
									isPossibleMove={validMoves.some(move => move.row === cellPos.row && move.col === cellPos.col)} // True si cette case est un coup valide
								/>
							);
						})}
					</div>
				))}
			</>
		);
	};

	return (
		<div className="board-container">
			{/* Barre d'état : affiche le score et le statut du jeu */}
			<StatusBar
				board={board}
				xIsNext={xIsNext}
				currentPlayerHasMoves={currentPlayerHasMoves}
				opponentHasMoves={opponentHasMoves}
			/>

			{/* Bouton "Pass" - Apparaît si le joueur actuel ne peut pas jouer mais l'adversaire oui */}
			{ !currentPlayerHasMoves && opponentHasMoves && (
				<button
					className="pass-button"
					onClick={() => {
						// Crée une copie du plateau sans modification (passer son tour)
						const nextBoard: BoardState = board.slice();
						// Transmet le même plateau pour indiquer un passage de tour
						onPlay(nextBoard);
					}}
				>
					Pass turn
				</button>
			)}

			{/* Conteneur du plateau de jeu */}
			<div className="board">
				{renderBoard()}
			</div>
		</div>
	);
}
