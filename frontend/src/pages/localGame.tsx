import { useLocalSocket } from "../hooks/useLocalSocket";
import GameEndModal from "../components/GameEndModal";
import MyBoard from "../components/Board";
import { useNavigate } from "react-router";
import type { Cell, Move } from "../types/gameTypes";
import { toClientBoard } from "../utils/cellConverter";
import LocalGameHeader from "../components/LocalGameHeader";
import { PAGE_WRAPPER_CLASSES, BOARD_COLUMN_CLASSES, ACTION_BUTTON_DANGER } from "../constants/layoutConstants";


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

  const validMovesIndexes: number[] = gameState?.validMoves ? gameState.validMoves.map((m: Move) => m.row * 8 + m.col) : [];

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
    <div className={PAGE_WRAPPER_CLASSES}>
      <h1 className="text-2xl font-bold">👥 Partie Locale (2 Joueurs)</h1>

      {!gameState ? (
        <button
          className="btn btn-primary px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 cursor-pointer"
          onClick={startLocalGame}
          disabled={!isConnected}
        >
          {isConnected ? "Start local match" : "Connecting to server..."}
        </button>
      ) : (
        <div className={BOARD_COLUMN_CLASSES}>
          {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>}
          <LocalGameHeader blackScore={blackScore} whiteScore={whiteScore} nextPlayer={gameState.currentPlayer} />
            <MyBoard
              board={currentBoard}
              validMoves={isFinished ? [] : validMovesIndexes}
              onCellClick={handleCellClick}
            />
          {/* Bouton Abandonner (affiché tant que la partie est en cours) */}
          {!isFinished && gameState && (
            <button
              onClick={() => giveUp(gameState.currentPlayer)}
              className={ACTION_BUTTON_DANGER}
            >
              End game
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
         </div>
      )}
    </div>
  );
}