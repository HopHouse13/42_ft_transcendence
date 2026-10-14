import React, { useState } from "react";
import { useStreamBotGame } from "../hooks/useStreamBotGame";
import GameEndModal from "../components/GameEndModal"; 

/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Interfaces & Types ~~                                    */
/* --------------------------------------------------------------------------------------------- */

type CellState = "BLACK" | "WHITE" | null;

interface MyCellProps {
  cell: CellState;
  index: number;
}

interface MyBoardProps {
  board?: CellState[];
}

/* --------------------------------------------------------------------------------------------- */
/*                                          ~~ MyCell (Statique) ~~                              */
/* --------------------------------------------------------------------------------------------- */
function MyCell({ cell, index }: MyCellProps) {
  return (
    <div className="hover-3d">
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-emerald-700 rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] flex items-center justify-center relative transition-colors">
        {/* Jeton Noir */}
        {cell === "BLACK" && (
          <div className="w-4/5 h-4/5 rounded-full bg-radial from-gray-700 via-gray-950 to-black shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-black/40 transform transition-all duration-300 scale-100" />
        )}

        {/* Jeton Blanc */}
        {cell === "WHITE" && (
          <div className="w-4/5 h-4/5 rounded-full bg-radial from-white via-slate-100 to-slate-300 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] border border-slate-300 transform transition-all duration-300 scale-100" />
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                           ~~ Board (Statique) ~~                              */
/* --------------------------------------------------------------------------------------------- */
function MyBoard({ board }: MyBoardProps) {
  const defaultBoard: CellState[] = Array(64).fill(null);
  defaultBoard[27] = "WHITE";
  defaultBoard[28] = "BLACK";
  defaultBoard[35] = "BLACK";
  defaultBoard[36] = "WHITE";

  const currentBoard = board || defaultBoard;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="grid grid-cols-8 gap-1.5 p-4 rounded-xl bg-emerald-800 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.8)] border-[10px] border-amber-950 ring-1 ring-amber-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
        {currentBoard.map((cell, index) => ( 
          <MyCell key={index} cell={cell} index={index} /> 
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Page Stream Bot TV ~~                                    */
/* --------------------------------------------------------------------------------------------- */

export default function StreambotGame() {
  const { isConnected, error, gameState, isBotThinking, startStreamGame } = useStreamBotGame();

  const rawCells = gameState?.board;

  const currentBoard: CellState[] = rawCells ? rawCells.map((cell: any) => {
    if (!cell) return null;
    const color = typeof cell === "object" ? cell.color : cell;
    if (color === "BLACK" || color === 1) return "BLACK";
    if (color === "WHITE" || color === 2) return "WHITE";
    return null;
  }) : Array(64).fill(null);

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
              window.location.reload();
            }}
          />
        </>
      )}
    </div>
  );
}