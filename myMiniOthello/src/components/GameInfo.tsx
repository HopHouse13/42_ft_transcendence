import React from "react";
import { BoardState } from "../types/gameTypes";
import { getMoveDescription } from "../logic/gameLogic";

/**
 * Props du composant GameInfo.
 *
 * @property history - Historique de tous les états du plateau (index 0 = état initial).
 * @property currentMove - Index du coup actuel dans l'historique.
 * @property showLatestFirst - True pour afficher les coups du plus ancien au plus récent, false pour l'inverse.
 * @property onReverse - Callback pour inverser l'ordre d'affichage des coups.
 * @property onJumpTo - Callback pour naviguer vers un coup spécifique dans l'historique.
 */
interface GameInfoProps {
	history: BoardState[];
	currentMove: number;
	showLatestFirst: boolean;
	onReverse: () => void;
	onJumpTo:  (move: number) => void;
}

/**
 * Composant GameInfo - Affiche l'historique des coups et permet de naviguer dans le temps.
 *
 * Fonctionnalités :
 * - Génère une liste des coups joués avec leur description.
 * - Permet d'inverser l'ordre d'affichage (ascendant/descendant).
 * - Permet de revenir à un coup précédent via onJumpTo.
 *
 * @param history - Historique complet des états du plateau.
 * @param currentMove - Index du coup actuel.
 * @param showLatestFirst - Ordre d'affichage (true = du début à la fin, false = de la fin au début).
 * @param onReverse - Fonction pour basculer l'ordre d'affichage.
 * @param onJumpTo - Fonction pour naviguer vers un coup spécifique.
 */
export default function GameInfo({history, currentMove, showLatestFirst, onReverse, onJumpTo}: GameInfoProps): React.ReactElement {
	// Génère une liste d'éléments JSX pour chaque coup de l'historique
	const moves = history.map((board: BoardState, move: number) => {
		// Récupère la description du coup (ex: "1. Black plays (3,4)", "2. White passes")
		const description = getMoveDescription(history, move);
		return (
			<li key={move}>
				{/* Bouton cliquable pour revenir à ce coup dans l'historique */}
				<button onClick={() => onJumpTo(move)}>
					{description}
				</button>
			</li>
		);
	});

	return (
		<div className="game-info">
			{/* Bouton pour inverser l'ordre d'affichage des coups (ascendant ↔ descendant) */}
			<button className="toggle-button" onClick={onReverse}>
				Reverse
			</button>

			{/* Liste ordonnée des coups joués */}
			<ol>
				{/* Affiche les coups dans l'ordre souhaité :
				     - Si showLatestFirst=true : du premier au dernier coup (moves.reverse() car map a créé dans l'ordre naturel)
				     - Si showLatestFirst=false : du dernier au premier coup (order naturel) */}
				{showLatestFirst ? moves.reverse() : moves}
			</ol>
		</div>
	);
}
