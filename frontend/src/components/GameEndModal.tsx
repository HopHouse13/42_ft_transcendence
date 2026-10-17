import React from "react";
import type { PlayerColor } from "../types/gameTypes";

interface GameEndModalProps {
  isOpen: boolean;
  winner: PlayerColor | "DRAW" | null;
  userColor?: PlayerColor;
  blackScore: number;
  whiteScore: number;
  onRestartOrRematch: () => void;
  onQuit: () => void;
}

export default function GameEndModal({
  isOpen,
  winner,
  userColor,
  blackScore,
  whiteScore,
  onRestartOrRematch,
  onQuit,
}: GameEndModalProps) {
  if (!isOpen) return null;

  // Calcul du message principal selon le résultat
  const isDraw = winner === "DRAW";
  const isUserWinner = userColor && winner === userColor;

  let title = "Fin de partie";
  let titleColor = "text-[#e8e6e3]";

  if (isDraw) {
    title = "Égalité !";
    titleColor = "text-[#9e9b97]";
  } else if (userColor) {
    title = isUserWinner ? "Victoire !" : "Défaite";
    titleColor = isUserWinner ? "text-[#81b64c]" : "text-[#e65353]";
  } else {
    title = winner === "BLACK" ? "Les Noirs gagnent !" : "Les Blancs gagnent !";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-[#3d3a36] bg-[#262421] p-6 shadow-2xl text-center flex flex-col items-center gap-5">
        
        {/* Titre & Résultat */}
        <div className="flex flex-col gap-1">
          <h2 className={`text-2xl font-black uppercase tracking-wide ${titleColor}`}>
            {title}
          </h2>
          <p className="text-xs text-[#9e9b97]">
            {isDraw
              ? "Aucun joueur n'a pu faire la différence."
              : `La partie s'est terminée par un score de ${blackScore} - ${whiteScore}.`}
          </p>
        </div>

        {/* Tableau comparatif des scores façon Chess.com */}
        <div className="flex w-full items-center justify-around rounded-xl bg-[#1f1e1c] p-4 border border-[#3d3a36]">
          {/* Joueur Noir */}
          <div className="flex flex-col items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-black border border-[#6b6865]" />
            <span className="text-xs font-semibold text-[#9e9b97]">Noirs</span>
            <span className="text-xl font-bold text-[#e8e6e3]">{blackScore}</span>
          </div>

          <div className="text-sm font-bold text-[#6b6865]">VS</div>

          {/* Joueur Blanc */}
          <div className="flex flex-col items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-white border border-[#6b6865]" />
            <span className="text-xs font-semibold text-[#9e9b97]">Blancs</span>
            <span className="text-xl font-bold text-[#e8e6e3]">{whiteScore}</span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col w-full gap-2 mt-2">
          <button
            onClick={onRestartOrRematch}
            className="w-full py-3 bg-[#81b64c] hover:bg-[#6f9e40] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
          >
            Nouvelle partie
          </button>
          <button
            onClick={onQuit}
            className="w-full py-2.5 bg-[#302e2b] hover:bg-[#3d3a36] text-[#e8e6e3] font-semibold text-xs rounded-xl border border-[#3d3a36] transition-all cursor-pointer"
          >
            Retour au menu
          </button>
        </div>

      </div>
    </div>
  );
}