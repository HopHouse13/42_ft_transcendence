import type { Direction } from "../types/gameTypes";

// CONFIGURATION DU PLATEAU
export const BOARD_SIZE = 8;

export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

/** L'ensemble des directions entourant un pion (8 directions) */
export const DIRECTIONS: Direction[] = [
	[-1, -1], [-1, 0], [-1, 1],
	[ 0, -1],          [ 0, 1],
	[ 1, -1], [ 1, 0], [ 1, 1]
];
