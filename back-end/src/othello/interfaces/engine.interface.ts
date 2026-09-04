/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

/*
 *
 *
 *
 * */

export type Cell = 'EMPTY' | 'BLACK' | 'WHITE' ;

export type Player = 'BLACK' | 'WHITE'

export type Move =  {

  row: number;
  col: number;

};

export type GameResult =  {

  winner:      Player | 'DRAW' ;
  blackCount:  number ;
  whiteCount:  number ;

};

export const DIRECTIONS: [number, number][] = [

  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

/* ========================================================================== */
