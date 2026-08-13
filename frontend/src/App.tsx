/*
import { useState } from 'react';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import { createInitialBoard, getValidMoveFlips, applyMove, calculateScores } from './game/othello';
import { Board as BoardType } from './types/othello.types';

export default function App() {
  // useState : mémoire interne du composant. Quand on l'appelle avec setBoard(...),
  // React redessine automatiquement tout ce qui affiche "board".
  const [board, setBoard] = useState<BoardType>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');

  function handleCellClick(row: number, col: number) {
    const flips = getValidMoveFlips(board, { row, col }, currentPlayer);

    if (flips.length === 0) {
      console.log('Coup invalide');
      return;
    }

    const newBoard = applyMove(board, { row, col }, currentPlayer, flips);
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  }

  const scores = calculateScores(board);

  return (
    <div style={{ padding: 24 }}>
      <h1>Othello</h1>
      <ScoreBoard scores={scores} currentPlayer={currentPlayer} />
      <Board board={board} onCellClick={handleCellClick} />
    </div>
  );
} */

import { useState, useEffect } from 'react';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import { fetchGameState, sendMove, resetGame, GameState } from './api/gameApi';

export default function App() {
  // null au départ : tant que l'API n'a pas répondu, on n'a rien à afficher
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useEffect avec [] vide : s'exécute une seule fois, au premier affichage du composant
  // C'est ici qu'on va chercher l'état initial de la partie sur le serveur
  useEffect(() => {
    fetchGameState().then(setGameState);
  }, []);

  async function handleCellClick(row: number, col: number) {
    setError(null);
    try {
      const newState = await sendMove(row, col);
      setGameState(newState);
    } catch {
      setError('Coup invalide');
    }
  }

  async function handleReset() {
    const newState = await resetGame();
    setGameState(newState);
    setError(null);
  }

  // Tant que l'API n'a pas encore répondu, on affiche un message de chargement
  // plutôt que de planter en essayant d'afficher un board qui n'existe pas encore
  if (!gameState) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Othello</h1>
      <ScoreBoard scores={gameState.scores} currentPlayer={gameState.currentPlayer} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Board board={gameState.board} onCellClick={handleCellClick} />
      <button onClick={handleReset} style={{ marginTop: 16 }}>
        Recommencer
      </button>
      {gameState.isGameOver && <p>Partie terminée !</p>}
    </div>
  );
}
