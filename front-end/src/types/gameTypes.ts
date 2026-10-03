// ===== TYPES =====	

/** Type pour représenter un joueur */
export type Player = 'BLACK' | 'WHITE';

/** Type pour représenter un pion ou une case vide */
export type Cell = Player | null;

/** Type pour représenter un plateau */
export type BoardState = Cell[];

/** Type pour représenter une direction (delta ligne, delta colonne) */
export type Direction = [number, number];


// ===== INTERFACES =====

export interface Position {
	row: number;
	col: number;
}

/** Props pour le composant Square */
export interface SquareProps {
	pos: Position;
	/** Valeur de la case : 'BLACK' (noir), 'WHITE' (blanc) ou null (vide) */
	value: Cell;
	/** Fonction appelée lors du clic sur la case */
	onSquareClick: () => void;
	/** Indique si un coup est possible à cette position */
	isPossibleMove: boolean;
}

/** Props pour le composant Board */
export interface BoardProps {
	/** Indique si c'est au tour des noirs (BLACK) */
	// xIsNext: boolean;
	/** État actuel du plateau */
	board: BoardState;
	/** Fonction appelée après un coup valide */
	// onPlay: (squares: BoardState) => void;

	validMoves: Position[];

	onMove: (position: Position) => void;

	disabled: boolean;
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

export type GameMode = 'LOCAL' | 'BOT' | 'ONLINE';

type GameConfig = {
  LOCAL: Record<string, never>;
  BOT: { difficulty?: 'EASY' | 'MEDIUM' | 'HARD' };
  ONLINE: { timer?: 3 | 5 | 10 };
};

export type CreateGameRequest = {
  [K in GameMode]: { mode: K } & GameConfig[K];
}[GameMode];

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' ;
export type PlayerColor = 'BLACK' | 'WHITE';
export type ServerCell = 'BLACK' | 'WHITE' | 'EMPTY';
export type Move = { row: number, col: number};

export interface PlayerInfo {
	userId: string;
	color: PlayerColor;
	connected: boolean;
};

export interface GameResult {
	winner: PlayerColor | 'DRAW';
	blackCount: number;
	whiteCount: number;
}

export interface GameState {
  gameId:         string;
  cells:          ServerCell[];
  status:         GameStatus;
  players:        PlayerInfo[];
  currentPlayer:  PlayerColor;
  validMoves:     Move[];
  result?:        GameResult;
  createdAt:      string;
}