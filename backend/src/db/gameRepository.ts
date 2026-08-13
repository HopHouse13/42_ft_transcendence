import { pool } from './pool';
import { Board } from '../types/othello.types';

interface StoredGame {
  board: Board;
  current_player: 'black' | 'white';
  is_game_over: boolean;
}

// Récupère la partie en cours (id=1). Renvoie null si aucune partie n'existe encore.
export async function loadGame(): Promise<StoredGame | null> {
  const result = await pool.query(
    'SELECT board, current_player, is_game_over FROM games WHERE id = 1'
  );
  return result.rows[0] ?? null;
}

// Insère ou met à jour la partie en cours.
// ON CONFLICT ... DO UPDATE : si la ligne id=1 existe déjà, on la remplace
// plutôt que d'échouer avec une erreur de doublon de clé primaire.
export async function saveGame(
  board: Board,
  currentPlayer: 'black' | 'white',
  isGameOver: boolean
): Promise<void> {
  await pool.query(
    `INSERT INTO games (id, board, current_player, is_game_over)
     VALUES (1, $1, $2, $3)
     ON CONFLICT (id) DO UPDATE
     SET board = $1, current_player = $2, is_game_over = $3`,
    [JSON.stringify(board), currentPlayer, isGameOver]
  );
}
