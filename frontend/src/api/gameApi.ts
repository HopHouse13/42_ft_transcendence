import { Board } from '../types/othello.types';

const API_URL = 'http://localhost:3000/api';

export interface GameState {
  board: Board;
  currentPlayer: 'black' | 'white';
  isGameOver: boolean;
  scores: { black: number; white: number };
}

// Récupère l'état actuel de la partie depuis le back-end
export async function fetchGameState(): Promise<GameState> {
  const response = await fetch(`${API_URL}/game`);
  return response.json();
}

// Envoie un coup au back-end, reçoit le nouvel état en retour
export async function sendMove(row: number, col: number): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col }),
  });

  if (!response.ok) {
    throw new Error('Coup invalide');
  }

  return response.json();
}

// Réinitialise la partie côté back-end
export async function resetGame(): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/reset`, { method: 'POST' });
  return response.json();
}
