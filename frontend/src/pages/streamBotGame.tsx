import React, { useState } from "react";
import { useStreamBotGame } from "../hooks/useStreamBotGame";
import GameEndModal from "../components/GameEndModal"; 
import MyBoard from "../components/Board";
import { useNavigate } from "react-router";
import type { Cell } from "../types/gameTypes";
import { toClientBoard } from "../utils/cellConverter";


/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Page Stream Bot TV ~~                                    */
/* --------------------------------------------------------------------------------------------- */

export default function StreambotGame() {
  const { isConnected, error, gameState, isBotThinking, startStreamGame } = useStreamBotGame();

  const navigate = useNavigate();

  const rawCells = gameState?.board;

  const currentBoard: Cell[] = rawCells 
    ? toClientBoard(rawCells)
    : Array(64).fill(null);

  // Calcul des scores
  const blackScore = currentBoard.filter(cell => cell === "BLACK").length;
  const whiteScore = currentBoard.filter(cell => cell === "WHITE").length;

  const isFinished = gameState?.status === 'FINISHED';
  let winner: "BLACK" | "WHITE" | "DRAW" | null = null;
  if (isFinished) {
    if (blackScore > whiteScore) winner = "BLACK";
    else if (whiteScore > blackScore) winner = "WHITE";
    else winner = "DRAW";
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 relative">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <h1 className="text-2xl font-bold">📺 Stream Bot TV (IA vs IA)</h1>
      </div>

      {!gameState ? (
        <button 
          className="btn btn-primary bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer shadow-md" 
          onClick={startStreamGame} 
          disabled={!isConnected}
        >
          {isConnected ? "Lancer le Stream en direct" : "Connexion au serveur..."}
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-md px-2">
            <span className="text-sm text-amber-200">
              {!isFinished ? (
                <span>
                  Tour actuel : <span className="font-bold">{gameState.currentPlayer}</span>
                  {isBotThinking && <span className="ml-2 text-xs text-red-400 animate-pulse">(Réflexion...)</span>}
                </span>
              ) : (
                <span className="font-bold text-amber-400">Diffusion terminée</span>
              )}
            </span>

            <div className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-full border border-slate-700">
              Noirs: <strong className="text-black bg-white px-1.5 py-0.5 rounded ml-1">{blackScore}</strong> | Blancs: <strong className="text-white bg-slate-600 px-1.5 py-0.5 rounded ml-1">{whiteScore}</strong>
            </div>
          </div>

          {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>}

          {/* Plateau de streaming (sans interactions utilisateur) */}
          <MyBoard board={currentBoard} />

          {/* Modal de fin de partie du stream */}
          <GameEndModal
            isOpen={isFinished}
            winner={winner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            onRestartOrRematch={() => {
              startStreamGame(); // Relancer un nouveau stream
            }}
            onQuit={() => {
              localStorage.removeItem("othello_stream_game_id");
              navigate("/game");
            }}
          />
        </>
      )}
    </div>
  );
}