/*
import { Request, Response } from 'express';
import { Board } from '../types/othello.types';
import {
  createInitialBoard,
  validateMove,
  applyMove,
  buildGameState,
  getValidMoves,
} from '../game/othello.logic';

// État en mémoire de la partie — voir la remarque sur l'absence de BDD pour l'instant.
// currentPlayer commence toujours par 'black', règle standard d'Othello.
let board: Board = createInitialBoard();
let currentPlayer: 'black' | 'white' = 'black';

// GET /api/game — renvoie l'état actuel de la partie
export function getGameState(req: Request, res: Response) {
  const state = buildGameState(board, currentPlayer);
  res.json(state);
}

// POST /api/game/move — joue un coup
// Corps de requête attendu : { "row": number, "col": number }
export function playMove(req: Request, res: Response) {
  const { row, col } = req.body;

  // Vérification basique des entrées avant même de toucher à la logique de jeu
  if (typeof row !== 'number' || typeof col !== 'number') {
    return res.status(400).json({ error: 'row et col doivent être des nombres' });
  }

  const validation = validateMove(board, { row, col }, currentPlayer);

  if (!validation.isValid) {
    return res.status(400).json({ error: 'Coup invalide' });
  }

  board = applyMove(board, { row, col }, currentPlayer, validation.cellsToFlip);

  // Passe au joueur suivant, seulement s'il a au moins un coup possible.
  // Sinon on garde le même joueur (règle d'Othello : passer si bloqué).
  const opponent = currentPlayer === 'black' ? 'white' : 'black';
  currentPlayer = getValidMoves(board, opponent).length > 0 ? opponent : currentPlayer;

  const state = buildGameState(board, currentPlayer);
  res.json(state);
}

// POST /api/game/reset — recommence une nouvelle partie
export function resetGame(req: Request, res: Response) {
  board = createInitialBoard();
  currentPlayer = 'black';
  const state = buildGameState(board, currentPlayer);
  res.json(state);
}
*/

import { Request, Response } from 'express';
import {
  createInitialBoard,
  validateMove,
  applyMove,
  buildGameState,
  getValidMoves,
} from '../game/othello.logic';
import { loadGame, saveGame } from '../db/gameRepository';

// GET /api/game — charge l'état depuis PostgreSQL ; si aucune partie n'existe
// encore (premier lancement), en crée une nouvelle et la sauvegarde
export async function getGameState(req: Request, res: Response) {
  let stored = await loadGame();

  if (!stored) {
    const board = createInitialBoard();
    await saveGame(board, 'black', false);
    stored = { board, current_player: 'black', is_game_over: false };
  }

  const state = buildGameState(stored.board, stored.current_player);
  res.json(state);
}

export async function playMove(req: Request, res: Response) {
  const { row, col } = req.body;

  if (typeof row !== 'number' || typeof col !== 'number') {
    return res.status(400).json({ error: 'row et col doivent être des nombres' });
  }

  const stored = await loadGame();
  if (!stored) {
    return res.status(400).json({ error: 'Aucune partie en cours' });
  }

  const validation = validateMove(stored.board, { row, col }, stored.current_player);

  if (!validation.isValid) {
    return res.status(400).json({ error: 'Coup invalide' });
  }

  const newBoard = applyMove(stored.board, { row, col }, stored.current_player, validation.cellsToFlip);

  const opponent = stored.current_player === 'black' ? 'white' : 'black';
  const nextPlayer = getValidMoves(newBoard, opponent).length > 0 ? opponent : stored.current_player;

  await saveGame(newBoard, nextPlayer, false);

  const state = buildGameState(newBoard, nextPlayer);
  res.json(state);
}

export async function resetGame(req: Request, res: Response) {
  const board = createInitialBoard();
  await saveGame(board, 'black', false);
  const state = buildGameState(board, 'black');
  res.json(state);
}
