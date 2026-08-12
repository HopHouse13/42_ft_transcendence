import { Board, Cell, Move, MoveValidation, GameState } from '../types/othello.types';

const BOARD_SIZE = 8;

// Les 8 directions autour d'une case : haut, bas, gauche, droite, 4 diagonales
// Représentées comme des déplacements [deltaLigne, deltaColonne]
const DIRECTIONS: Move[] = [
  { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
  { row: 0, col: -1 },                        { row: 0, col: 1 },
  { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
];

// Crée un plateau vide de 8x8, puis place les 4 pions initiaux au centre
export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill('empty')
  );

  // Position de départ standard d'Othello
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';

  return board;
}

// Renvoie la couleur adverse
function getOpponent(player: 'black' | 'white'): 'black' | 'white' {
  return player === 'black' ? 'white' : 'black';
}

// Vérifie qu'une case donnée existe bien sur le plateau (évite de sortir du tableau)
function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Cœur de la logique : pour UNE direction donnée, cherche une ligne continue
// de pions adverses suivie d'un pion allié. Si trouvé, renvoie les pions
// adverses à retourner dans cette direction. Sinon, tableau vide.
function getFlipsInDirection(
  board: Board,
  move: Move,
  player: 'black' | 'white',
  direction: Move
): Move[] {
  const opponent = getOpponent(player);
  const flips: Move[] = [];

  let currentRow = move.row + direction.row;
  let currentCol = move.col + direction.col;

  // On avance tant qu'on trouve des pions adverses
  while (isOnBoard(currentRow, currentCol) && board[currentRow][currentCol] === opponent) {
    flips.push({ row: currentRow, col: currentCol });
    currentRow += direction.row;
    currentCol += direction.col;
  }

  // Le coup n'est valide dans cette direction que si :
  // - on a bien traversé au moins un pion adverse (flips non vide)
  // - ET la case juste après est bien un pion allié (pas vide, pas hors plateau)
  const endsOnOwnPiece =
    isOnBoard(currentRow, currentCol) && board[currentRow][currentCol] === player;

  if (flips.length > 0 && endsOnOwnPiece) {
    return flips;
  }

  return [];
}

// Vérifie si un coup est valide, en testant les 8 directions
export function validateMove(
  board: Board,
  move: Move,
  player: 'black' | 'white'
): MoveValidation {
  // Un coup n'est jouable que sur une case vide
  if (!isOnBoard(move.row, move.col) || board[move.row][move.col] !== 'empty') {
    return { isValid: false, cellsToFlip: [] };
  }

  let allFlips: Move[] = [];

  for (const direction of DIRECTIONS) {
    const flipsInThisDirection = getFlipsInDirection(board, move, player, direction);
    allFlips = allFlips.concat(flipsInThisDirection);
  }

  return {
    isValid: allFlips.length > 0,
    cellsToFlip: allFlips,
  };
}

// Calcule tous les coups valides pour un joueur, utile pour savoir
// s'il doit passer son tour (aucun coup possible) ou pour aider le front-end
// à afficher les cases jouables
export function getValidMoves(board: Board, player: 'black' | 'white'): Move[] {
  const validMoves: Move[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const validation = validateMove(board, { row, col }, player);
      if (validation.isValid) {
        validMoves.push({ row, col });
      }
    }
  }

  return validMoves;
}

// Applique un coup : place le pion, puis retourne tous les pions capturés
// Ne fait AUCUNE vérification de validité — c'est le rôle de validateMove.
// On sépare volontairement "vérifier" et "appliquer" pour que chaque fonction
// ait une seule responsabilité claire.
export function applyMove(
  board: Board,
  move: Move,
  player: 'black' | 'white',
  cellsToFlip: Move[]
): Board {
  // On copie le plateau plutôt que de le modifier directement (immutabilité) :
  // ça évite des bugs sournois si une autre partie du code garde une référence
  // vers l'ancien plateau et s'attend à ce qu'il ne change pas
  const newBoard: Board = board.map((row) => [...row]);

  newBoard[move.row][move.col] = player;

  for (const cell of cellsToFlip) {
    newBoard[cell.row][cell.col] = player;
  }

  return newBoard;
}

// Compte les pions de chaque couleur, pour le score
export function calculateScores(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      if (cell === 'white') white++;
    }
  }

  return { black, white };
}

// Détermine si la partie est terminée : plus aucun coup valide pour personne
export function isGameOver(board: Board): boolean {
  const blackHasMove = getValidMoves(board, 'black').length > 0;
  const whiteHasMove = getValidMoves(board, 'white').length > 0;
  return !blackHasMove && !whiteHasMove;
}

// Construit l'état complet à renvoyer au front-end
export function buildGameState(board: Board, currentPlayer: 'black' | 'white'): GameState {
  return {
    board,
    currentPlayer,
    isGameOver: isGameOver(board),
    scores: calculateScores(board),
  };
}
