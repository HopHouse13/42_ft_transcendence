import React from "react";
import type { PlayerColor } from "../types/gameTypes";

interface ColorSelectionModalProps {
  isOpen: boolean;
  onSelectColor: (color: "BLACK" | "WHITE") => void;
}

export default function ColorSelectionModal({
  isOpen,
  onSelectColor,
}: ColorSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-[#3d3a36] bg-[#262421] p-6 shadow-2xl text-center flex flex-col items-center gap-5">
        
        {/* Titre & Description */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black uppercase tracking-wide text-[#e8e6e3]">
            Choisissez votre camp
          </h2>
          <p className="text-xs text-[#9e9b97]">
            Les Noirs commencent toujours la partie.
          </p>
        </div>

        {/* Boutons de sélection de couleur */}
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          {/* Option Noir */}
          <button
            onClick={() => onSelectColor("BLACK")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#1f1e1c] hover:bg-[#302e2b] border border-[#3d3a36] hover:border-[#81b64c] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-radial from-gray-700 via-gray-950 to-black shadow-md border border-black/40 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-[#e8e6e3]">Noirs (1er)</span>
          </button>

          {/* Option Blanc */}
          <button
            onClick={() => onSelectColor("WHITE")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#1f1e1c] hover:bg-[#302e2b] border border-[#3d3a36] hover:border-[#81b64c] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-radial from-white via-slate-100 to-slate-300 shadow-md border border-slate-300 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-[#e8e6e3]">Blancs</span>
          </button>
        </div>

      </div>
    </div>
  );
}

