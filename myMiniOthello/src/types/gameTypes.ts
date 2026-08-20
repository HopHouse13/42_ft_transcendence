// ===== TYPES =====	

/** Type pour représenter un joueur */
export type Player = 'X' | 'O';

/** Type pour représenter un pion ou une case vide */
export type Pawn = Player | null;

/** Type pour représenter un plateau */
export type BoardState = Pawn[];

/** Type pour représenter une direction (delta ligne, delta colonne) */
export type Direction = [number, number];


// ===== INTERFACES =====

export interface Position {
	row: number;
	col: number;
}

/** Props pour le composant Square */
export interface SquareProps {
	/** Valeur de la case : 'X' (noir), 'O' (blanc) ou null (vide) */
	value: Pawn;
	/** Fonction appelée lors du clic sur la case */
	onSquareClick: () => void;
	/** Indique si un coup est possible à cette position */
	isPossibleMove: boolean;
}

/** Props pour le composant Board */
export interface BoardProps {
	/** Indique si c'est au tour des noirs (X) */
	xIsNext: boolean;
	/** État actuel du plateau */
	board: BoardState;
	/** Fonction appelée après un coup valide */
	onPlay: (squares: BoardState) => void;
}

/** Props pour le composant GameInfo */
export interface GameInfoProps {
	/** Historique des états du plateau */
	history: BoardState[];
	/** Numéro du prochain coup */
	currentMove: number;
	/** Indique l'ordre d'affichage de l'historique de coup */
	ascending: boolean;
	/** Fonction appelée lors du clic sur le boutton Reverse */
	onRevers: () => void;
	/** Fonction appelée lors du clic sur un coup de l'historique */
	onJumpTo: (move: number) => void;
}
