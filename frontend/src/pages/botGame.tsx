import { useState } from "react";
import { useBotSocket } from "../hooks/useBotSocket";
import GameEndModal from "../components/GameEndModal"; 
import ColorSelectionModal from "../components/SelectionBotModal";
import MyBoard from "../components/Board";
import { useNavigate } from "react-router";
import type { Cell, Move } from "../types/gameTypes";
import { toClientBoard } from "../utils/cellConverter";
import BotGameHeader from "../components/BotGameHeader";

/* --------------------------------------------------------------------------------------------- */
/*                                   ~~ Page Bot Game ~~                                         */
/* --------------------------------------------------------------------------------------------- */

export default function Botgame() {
  const { isConnected, gameState, isMovePending, startBotGame, playMove, giveUp } = useBotSocket();

  // État local pour contrôler l'affichage du modal de sélection de couleur
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [myColor, setMyColor] = useState<"BLACK" | "WHITE">("WHITE")

  const navigate = useNavigate();

  const rawCells = gameState?.board;

  const currentBoard: Cell[] = rawCells 
    ? toClientBoard(rawCells)
    : Array(64).fill(null);

  const validMovesIndexes: number[] = gameState?.validMoves ? gameState.validMoves.map((m: Move) => m.row * 8 + m.col) : [];

  const handleCellClick = (index: number) => {
    if (isMovePending || !gameState || gameState.status === 'FINISHED') return;
    const row = Math.floor(index / 8);
    const col = index % 8;
    playMove({ row, col });
  };

  const blackScore = currentBoard.filter(cell => cell === 'BLACK').length;
  const whiteScore = currentBoard.filter(cell => cell === "WHITE").length;

  const isFinished = gameState?.status === 'FINISHED';
  let winner: "BLACK" | "WHITE" | "DRAW" | null = null;
  if (isFinished) {
    if (blackScore > whiteScore) winner = "BLACK";
    else if (whiteScore > blackScore) winner = "WHITE";
    else winner = "DRAW";
  }

  // Fonction appelée lorsque l'utilisateur choisit sa couleur dans le modal
  const handleSelectColor = (color: "BLACK" | "WHITE") => {
    setMyColor(color);
    setIsColorModalOpen(false);
    startBotGame(color); // 💡 Passe la couleur choisie à ton hook si supporté, ou appelle startBotGame() simplement
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 relative">
      <h1 className="text-2xl font-bold">🤖 Partie contre le Bot</h1>

      {!gameState ? (
        <button 
          className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer" 
          onClick={() => setIsColorModalOpen(true)} // 👈 Ouvre le modal au lieu de lancer direct
          disabled={!isConnected}
        >
          {isConnected ? "Démarrer contre l'IA" : "Connexion au serveur..."}
        </button>
      ) : (
        <>

            

          {/* {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>} */}
          <BotGameHeader blackScore={blackScore} whiteScore={whiteScore} myColor={myColor} nextPlayer={gameState.currentPlayer}/>
          <MyBoard board={currentBoard} validMoves={isFinished ? [] : validMovesIndexes} onCellClick={handleCellClick} />

          {!isFinished && (
            <button
              onClick={giveUp}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              Abandonner
            </button>
          )}
          
          {/* Modal de fin de partie */}
          <GameEndModal
            isOpen={isFinished}
            winner={winner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            onRestartOrRematch={() => {
              setIsColorModalOpen(true); // Réouvre le choix de couleur pour une nouvelle partie
            }}
            onQuit={() => {
              localStorage.removeItem("othello_bot_game_id");
              navigate("/game");
            }}
          />
        </>
      )}

      {/* Modal de sélection de couleur */}
      <ColorSelectionModal
        isOpen={isColorModalOpen}
        onSelectColor={handleSelectColor}
      />
    </div>
  );
}