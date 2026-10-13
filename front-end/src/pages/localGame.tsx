import React, { useState, useEffect } from "react";
import Board from "../components/Board";
import PlayerCard from "../components/PlayerCard";
import ScoreCard from "../components/ScoreCard";
import History from "../components/History";
import GameEndModal from "../components/GameEndModal";
import type { Player, BoardState, Position, MoveHistoryEntry } from "../types/gameTypes";
import type { LocalMoveHistoryEntry } from "../hooks/useLocalGame";
import { BOARD_SIZE } from "../constants/gameConstants";
import { getIndex } from "../logic/gameLogic";

import LocalGame from "../components/LocalGame" ;

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

// 1. Composant MyCell avec destructuration propre des props
function MyCell({ cell, index, validMoves, onCellClick }: MyCellProps) {
  
  const [isBlack, setIsBlack] = useState(true)
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
// 2. Composant MyBoard
function MyBoard({ board, validMoves = [], onCellClick }: MyBoardProps) {
  // Grille par défaut 8x8
  const defaultBoard: CellState[] = Array(64).fill(null);
  defaultBoard[27] = "WHITE";
  defaultBoard[28] = "BLACK";
  defaultBoard[35] = "BLACK";
  defaultBoard[36] = "WHITE";

  const currentBoard = board || defaultBoard;

  return (
    <div className="flex justify-center items-center p-4">
      {/* Plateau de jeu vert sombre Othello */}
      <div className="grid grid-cols-8 gap-1.5 p-4 rounded-xl bg-emerald-800 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.8)] border-[10px] border-amber-950 ring-1 ring-amber-900/50 relative overflow-hidden">
  
        {/* Effet d'éclairage ambiant sur le plateau */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
        {/* On boucle sur chaque case du plateau */}
        {currentBoard.map((cell, index) => ( <MyCell key={index} cell={cell} index={index} validMoves={validMoves} onCellClick={onCellClick} /> ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Page Local Game ~~                                       */
/* --------------------------------------------------------------------------------------------- */

export default function Localgame() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      text: "Bonne chance pour la partie !",
      senderId: "opponent",
      author: "Adversaire",
      time: "14:00",
    },
  ]);

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      senderId: "me",
      author: "Vous",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    
    <div> {/* Plateau Othello */}
      
      <MyBoard />
    </div>

  );
}







