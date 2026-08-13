import { Board, Cell, Move } from '../types/othello.types';

const BOARD_SIZE = 8;

const DIRECTIONS: Move[] = [
  { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
  { row: 0, col: -1 },                        { row: 0, col: 1 },
  { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
];

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill('empty')
  );
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

function getOpponent(player: 'black' | 'white'): 'black' | 'white' {
  return player === 'black' ? 'white' : 'black';
}

function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getFlipsInDirection(board: Board, move: Move, player: 'black' | 'white', direction: Move): Move[] {
  const opponent = getOpponent(player);
  const flips: Move[] = [];
  let r = move.row + direction.row;
  let c = move.col + direction.col;

  while (isOnBoard(r, c) && board[r][c] === opponent) {
    flips.push({ row: r, col: c });
    r += direction.row;
    c += direction.col;
  }

  const endsOnOwnPiece = isOnBoard(r, c) && board[r][c] === player;
  return flips.length > 0 && endsOnOwnPiece ? flips : [];
}

export function getValidMoveFlips(board: Board, move: Move, player: 'black' | 'white'): Move[] {
  if (!isOnBoard(move.row, move.col) || board[move.row][move.col] !== 'empty') {
    return [];
  }
  let allFlips: Move[] = [];
  for (const direction of DIRECTIONS) {
    allFlips = allFlips.concat(getFlipsInDirection(board, move, player, direction));
  }
  return allFlips;
}

export function applyMove(board: Board, move: Move, player: 'black' | 'white', cellsToFlip: Move[]): Board {
  const newBoard: Board = board.map((row) => [...row]);
  newBoard[move.row][move.col] = player;
  for (const cell of cellsToFlip) {
    newBoard[cell.row][cell.col] = player;
  }
  return newBoard;
}

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
