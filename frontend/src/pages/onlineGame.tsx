import React, { useState, useEffect } from "react";
import { useOnlineSocket } from "../hooks/useOnlineSocket";
import GameEndModal from "../components/GameEndModal";
import { ChatPanel, ChatMessage, ChatRoom } from "../components/Chat" 

/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Inteface & Type ~~                                       */
/* --------------------------------------------------------------------------------------------- */

type CellState = "BLACK" | "WHITE" | null;

interface MyCellProps {
  cell: CellState;
  index: number;
  validMoves: number[];
  onCellClick?: (index: number) => void;
}

interface MyBoardProps {
  board?: CellState[];
  validMoves?: number[];
  onCellClick?: (index: number) => void;
}

/* --------------------------------------------------------------------------------------------- */
/*                                          ~~ MyCell ~~                                         */
/* --------------------------------------------------------------------------------------------- */

function MyCell({ cell, index, validMoves, onCellClick }: MyCellProps) {
  const isValidMove = validMoves.includes(index);

  return (
    <div className="hover-3d">
      <button key={index} onClick={() => onCellClick && onCellClick(index)} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-emerald-700 hover:bg-emerald-600 rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] flex items-center justify-center relative transition-colors">
        {/* Jeton Noir */}
        {cell === "BLACK" && (
          <div className="w-4/5 h-4/5 rounded-full bg-radial from-gray-700 via-gray-950 to-black shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-black/40 transform transition-all duration-300 scale-100" />
        )}

        {/* Jeton Blanc */}
        {cell === "WHITE" && (
          <div className="w-4/5 h-4/5 rounded-full bg-radial from-white via-slate-100 to-slate-300 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] border border-slate-300 transform transition-all duration-300 scale-100" />
        )}

        {/* Indicateur de coup valide */}
        {isValidMove && !cell && (
          <div className="w-3 h-3 bg-green-300/60 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                           ~~ Board ~~                                         */
/* --------------------------------------------------------------------------------------------- */

function MyBoard({ board, validMoves = [], onCellClick }: MyBoardProps) {
  const defaultBoard: CellState[] = Array(64).fill(null);
  defaultBoard[27] = "WHITE";
  defaultBoard[28] = "BLACK";
  defaultBoard[35] = "BLACK";
  defaultBoard[36] = "WHITE";

  const currentBoard = board || defaultBoard;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="shrink-0 grid grid-cols-8 gap-1.5 p-4 rounded-xl bg-emerald-800 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.8)] border-[10px] border-amber-950 ring-1 ring-amber-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
        {currentBoard.map((cell, index) => ( <MyCell key={index} cell={cell} index={index} validMoves={validMoves} onCellClick={onCellClick} /> ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                 ~~ Page Online Game ~~                                        */
/* --------------------------------------------------------------------------------------------- */

export default function OnlineGame() {
  const { isConnected, isWaiting, error, gameState, isMovePending, joinQueue, playMove, giveUp } = useOnlineSocket();

  const rawCells = gameState?.board;

  const currentBoard: CellState[] = rawCells ? rawCells.map((cell: any) => {
    if (!cell) return null;
    const color = typeof cell === "object" ? cell.color : cell;
    if (color === "BLACK" || color === 1) return "BLACK";
    if (color === "WHITE" || color === 2) return "WHITE";
    return null;
  }) : Array(64).fill(null);

  const validMovesIndexes = gameState?.validMoves ? gameState.validMoves.map((m: any) => m.row * 8 + m.col) : [];

  const handleCellClick = (index: number) => {
    if (isMovePending || !gameState || gameState.status === 'FINISHED') return;
    const row = Math.floor(index / 8);
    const col = index % 8;
    playMove({ row, col });
  };

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
      <h1 className="text-2xl font-bold">🌐 Partie en Ligne (Matchmaking)</h1>

      {!gameState && !isWaiting ? (
        <button 
          className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer" 
          onClick={() => joinQueue()} 
          disabled={!isConnected}
        >
          {isConnected ? "Rechercher une partie" : "Connexion au serveur..."}
        </button>
      ) : isWaiting && !gameState ? (
        <div className="flex flex-col items-center gap-3 p-8 bg-[#262421] rounded-2xl border border-[#3d3a36]">
          <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          <p className="text-sm text-amber-200 animate-pulse">Recherche d'un adversaire en cours...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-md px-2">
            <span className="text-sm text-amber-200">
              {!isFinished ? (
                <span>Tour actuel : <span className="font-bold">{gameState?.currentPlayer}</span></span>
              ) : (
                <span className="font-bold text-amber-400">Partie terminée</span>
              )}
            </span>

            {!isFinished && (
              <button
                onClick={giveUp}
                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                Abandonner
              </button>
            )}
          </div>

          {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>}

          
          {/* Conteneur principal 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl items-center">
            
            {/* Colonne de gauche : Board de jeux */}
            <div className="flex flex-col gap-4 shrink-0">
              <MyBoard board={currentBoard} validMoves={isFinished ? [] : validMovesIndexes} onCellClick={handleCellClick} />

            </div>

            {/* Colonne de droite : Chat global / d'attente */}
            <div className="flex justify-center md:justify-end w-full">
              <ChatRoom />
            </div>

          </div>
        

          {/* Modal de fin de partie */}
          <GameEndModal
            isOpen={isFinished}
            winner={winner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            onRestartOrRematch={() => {
              joinQueue();
            }}
            onQuit={() => {
              localStorage.removeItem("othello_online_game_id");
              window.location.reload();
            }}
          />
        </>
      )}
    </div>
  );
}