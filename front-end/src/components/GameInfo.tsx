import React from "react";
import type { BoardState } from "../types/gameTypes";
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
	// Génère une liste d'éléments pour chaque coup de l'historique
	const moves = history.map((board: BoardState, move: number) => {
		// Récupère la description du coup (ex: "1. Black plays (3,4)", "2. White passes")
		const description = getMoveDescription(history, move);
		return (
			// Chaque coup est encapsulé dans une carte avec un bouton cliquable
			<div key={move} className="card bg-base-100 p-2 mb-2 shadow-sm hover:shadow-md transition-shadow">
				{/* Bouton cliquable pour revenir à ce coup dans l'historique */}
				<button 
					onClick={() => onJumpTo(move)}
					className={`"btn btn-ghost btn-sm w-full text-left"
						${move === currentMove ? "btn-info" : " cursor-pointer hover:bg-base-200"}`}
				>
					{description}
				</button>
			</div>
		);
	});

	return (
		// Conteneur principal du composant avec un style de carte*/}
		<div className="card bg-base-200 p-4 shadow-md">
			{/* Bouton pour inverser l'ordre d'affichage des coups*/}
			<button className="btn btn-primary btn-sm w-full mb-4" onClick={onReverse}>
				{showLatestFirst ? "Show Latest First" : "Show Oldest First"}
			</button>

			{/* Conteneur pour la liste des coups avec un espacement vertical */}
			<div className="flex flex-col space-y-2 overflow-y-auto max-h-128">
				{/* Affiche les coups dans l'ordre choisi par l'utilisateur */}
				{showLatestFirst ? moves.reverse() : moves}
			</div>
		</div>
	);
}
