// Une case peut être vide, ou occupée par un pion noir ou blanc
export type Cell = 'empty' | 'black' | 'white';

// Le plateau est un tableau de 8 lignes, chaque ligne un tableau de 8 cases
export type Board = Cell[][];

// Un coup est repéré par sa ligne et sa colonne (0 à 7)
export interface Move {
  row: number;
  col: number;
}

// Résultat du calcul "est-ce que ce coup est jouable ?"
// On garde aussi la liste des pions qui seraient retournés, pour éviter
// de refaire le calcul une deuxième fois au moment d'appliquer le coup
export interface MoveValidation {
  isValid: boolean;
  cellsToFlip: Move[];
}

// État complet de la partie, tel qu'on le renverra au front-end
export interface GameState {
  board: Board;
  currentPlayer: 'black' | 'white';
  isGameOver: boolean;
  scores: {
    black: number;
    white: number;
  };
}
