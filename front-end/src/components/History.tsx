import React from "react";
import type { HistoryProps, MoveHistoryEntry, PlayerColor, Position } from "../types/gameTypes";

/**
 * Convertit une position en notation algébrique (a1 à h8).
 *
 * @param position - Position du pion posé (0-indexée)
 * @returns La case au format algébrique, ex: { row: 2, col: 3 } → "d3"
 */
function getSquare(position: Position): string {
	const column: string = String.fromCharCode('a'.charCodeAt(0) + position.col);
	return (`${column}${position.row + 1}`);
}

/**
 * Génère le label d'un coup : case en notation algébrique ou "passed".
 *
 * @param entry - Coup à décrire (undefined si la colonne n'a pas de coup pour ce tour)
 * @returns La case au format "d3" ou "passed"
 */
function getMoveLabel(entry: MoveHistoryEntry | undefined): string {
	if (!entry)
		return ("");
	if (entry.passed || !entry.position)
		return ("Skipped");
	return (getSquare(entry.position));
}

/**
 * Indicateur de couleur d'un joueur, version horizontale du liseré du GameHeader
 * (cf. PlayerCard) : barre noire ou blanche avec ombres internes.
 *
 * @param isBlack - True pour le joueur noir, false pour le joueur blanc
 */
function renderColorIndicator(isBlack: boolean): React.ReactElement {
	const stripeShade = isBlack
		? 'shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.9)]'
		: 'shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,0,0,0.45)]';

	return (
		<div
			className={`h-2.5 w-14 rounded-full ${isBlack ? 'bg-black' : 'bg-white'} ${stripeShade}`}
			title={isBlack ? 'Black' : 'White'}
			aria-hidden="true"
		/>
	);
}

/**
 * Composant History - Affiche l'historique des coups de la partie.
 *
 * Fonctionnalités :
 * - Liste les coups sur deux colonnes distinctes, une par joueur, appariées par tour
 *   avec le numéro du tour (1., 2., 3., ...) et les cases en notation algébrique
 *   (a1 à h8).
 * - Permet d'inverser l'ordre d'affichage (plus récent / plus ancien en premier).
 *
 * @param history - Historique complet des coups (index 0 = état initial).
 * @param leftColor - Couleur affichée dans la colonne de gauche (joueur local, cf. GameHeader).
 * @param showLatestFirst - Ordre d'affichage (true = coup le plus récent en premier).
 * @param onReverse - Fonction pour basculer l'ordre d'affichage.
 */
export default function History({ history, leftColor, showLatestFirst, onReverse }: HistoryProps): React.ReactElement {
	// Répartit les coups par colonne : à gauche le joueur local, à droite l'adversaire
	const rightColor: PlayerColor = leftColor === 'BLACK' ? 'WHITE' : 'BLACK';
	const leftMoves: MoveHistoryEntry[] = history.filter((entry) => entry.player === leftColor);
	const rightMoves: MoveHistoryEntry[] = history.filter((entry) => entry.player === rightColor);

	const rowCount = Math.max(leftMoves.length, rightMoves.length);
	const rows = Array.from({ length: rowCount }, (_, row) => row);
	const orderedRows = showLatestFirst ? [...rows].reverse() : rows;

	function renderMove(entry: MoveHistoryEntry | undefined): React.ReactElement {
		if (!entry)
			return (<div />);
		return (
			<div className="text-center">
				{getMoveLabel(entry)}
			</div>
		);
	}

	return (
		<div className="flex w-full min-h-0 flex-col p-4">
			<button className="btn btn-soft btn-info btn-sm w-full gap-2" onClick={onReverse}>
				{showLatestFirst ? (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 19V5M5 12l7-7 7 7" />
					</svg>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 5v14M5 12l7 7 7-7" />
					</svg>
				)}
				{showLatestFirst ? "Show Latest First" : "Show Oldest First"}
			</button>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				<div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
					<div />
					<div className="flex justify-center my-4">{renderColorIndicator(leftColor === 'BLACK')}</div>
					<div className="flex justify-center my-4">{renderColorIndicator(rightColor === 'BLACK')}</div>
					{orderedRows.map((row) => (
						<React.Fragment key={row}>
							<div className="text-sm font-semibold opacity-70">
								{row + 1}.
							</div>
							{renderMove(leftMoves[row])}
							{renderMove(rightMoves[row])}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
