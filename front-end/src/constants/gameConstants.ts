import type { BoardState, Direction } from "../types/gameTypes";

// CONFIGURATION DU PLATEAU

export const BOARD_SIZE = 8;

export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

/** L'ensemble des directions entourant un pion (8 directions) */
export const DIRECTIONS: Direction[] = [
	[-1, -1], [-1, 0], [-1, 1],
	[ 0, -1],          [ 0, 1],
	[ 1, -1], [ 1, 0], [ 1, 1]
];

/** Plateau de jeu intial 
 *  - Initailisation se fait par IIFE, fonction sans nom executée immédiatement 
*/
export const INITIAL_BOARD: BoardState = (() => {
	const board: BoardState = Array(TOTAL_CELLS).fill(null);
	const center = BOARD_SIZE / 2
	const centralRow1 = (center - 1) * BOARD_SIZE;
	const centralRow2 = center * BOARD_SIZE;

	board[centralRow1 + (center - 1)]	= 'WHITE';
	board[centralRow1 + center]			= 'BLACK';
	board[centralRow2 + (center - 1)]	= 'BLACK';
	board[centralRow2 + center]			= 'WHITE';
	
	return board;
})();

