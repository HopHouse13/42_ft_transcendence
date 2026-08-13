export type Cell = 'empty' | 'black' | 'white';
export type Board = Cell[][];

export interface Move {
  row: number;
  col: number;
}
