import React from "react";
import { useLocalSocket } from "../hooks/useLocalSocket";
import GameEndModal from "../components/GameEndModal"; 
import MyBoard from "../components/Board";
import { useNavigate } from "react-router";
import type { Cell } from "../types/gameTypes";
import { toClientBoard } from "../utils/cellConverter";

/* --------------------------------------------------------------------------------------------- */
/*                              ~~ Page Local Game (WebSocket) ~~                                */
/* --------------------------------------------------------------------------------------------- */

export default function Localgame() {
  const { isConnected, error, gameState, isMovePending, startLocalGame, playMove, giveUp } = useLocalSocket();

  const navigate = useNavigate();
  
  const rawCells = gameState?.board;

  const currentBoard: Cell[] = rawCells 
    ? toClientBoard(rawCells)
    : Array(64).fill(null);

  const validMovesIndexes = gameState?.validMoves ? gameState.validMoves.map((m: any) => m.row * 8 + m.col) : [];

  const handleCellClick = (index: number) => {
    if (isMovePending || !gameState || gameState.status === 'FINISHED') return;

    const row = Math.floor(index / 8);
    const col = index % 8;

    playMove({ row, col });
  };

  // Calcul des scores des Noirs et des Blancs à partir du plateau actuel
  const blackScore = currentBoard.filter(cell => cell === "BLACK").length;
  const whiteScore = currentBoard.filter(cell => cell === "WHITE").length;

  // Détermination du gagnant si la partie est terminée
  const isFinished = gameState?.status === 'FINISHED';
  let winner: "BLACK" | "WHITE" | "DRAW" | null = null;
  if (isFinished) {
    if (blackScore > whiteScore) winner = "BLACK";
    else if (whiteScore > blackScore) winner = "WHITE";
    else winner = "DRAW";
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 relative">
      <h1 className="text-2xl font-bold">👥 Partie Locale (2 Joueurs)</h1>

      {!gameState ? (
        <button 
          className="btn btn-primary px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 cursor-pointer" 
          onClick={startLocalGame} 
          disabled={!isConnected}
        >
          {isConnected ? "Démarrer la partie locale" : "Connexion au serveur..."}
        </button>
      ) : (
        <>
          <div className="text-sm text-amber-200">
            {!isFinished ? (
              <span>Tour actuel : <span className="font-bold">{gameState.currentPlayer}</span></span>
            ) : (
              <span className="font-bold text-amber-400">Partie terminée !</span>
            )}
          </div>

          {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>}

          <MyBoard board={currentBoard} validMoves={isFinished ? [] : validMovesIndexes} onCellClick={handleCellClick} />
          {/* Bouton Abandonner (affiché tant que la partie est en cours) */}
          {!isFinished && gameState && (
            <button
              onClick={() => giveUp(gameState.currentPlayer)}
              className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800/50 rounded-lg text-xs font-semibold transition-all cursor-pointer mt-2"
            >
              Terminer la partie
            </button>
          )}

          {/* Modal de fin de partie */}
          <GameEndModal
            isOpen={isFinished}
            winner={winner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            onRestartOrRematch={() => {
              // Nettoie et relance une partie
              startLocalGame();
            }}
            onQuit={() => {
              // Retour au menu / rafraîchissement ou nettoyage du state
              localStorage.removeItem("othello_local_game_id");
              navigate("/game");
            }}
          />
        </>
      )}
    </div>
  );
}