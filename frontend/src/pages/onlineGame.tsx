import { useOnlineSocket } from "../hooks/useOnlineSocket";
import GameEndModal from "../components/GameEndModal";
import { ChatRoom } from "../components/Chat"
import MyBoard from "../components/Board";
import { useNavigate } from "react-router";
import type { Cell, Move } from "../types/gameTypes";
import { toClientBoard } from "../utils/cellConverter";
import OnlineGameHeader from "../components/OnlineGameHeader";
import { PAGE_WRAPPER_CLASSES, BOARD_COLUMN_CLASSES, ACTION_BUTTON_DANGER } from "../constants/layoutConstants";


/* --------------------------------------------------------------------------------------------- */
/*                                 ~~ Page Online Game ~~                                        */
/* --------------------------------------------------------------------------------------------- */

export default function OnlineGame() {
  const { isConnected, isWaiting, error, gameState, isMovePending, joinQueue, playMove, giveUp } = useOnlineSocket();

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

  const blackScore = currentBoard.filter(cell => cell === "BLACK").length;
  const whiteScore = currentBoard.filter(cell => cell === "WHITE").length;

  const isFinished = gameState?.status === 'FINISHED';
  let winner = gameState?.result?.winner ?? null;

  if (isFinished && !winner) {
    if (blackScore > whiteScore) winner = "BLACK";
    else if (whiteScore > blackScore) winner = "WHITE";
    else winner = "DRAW";
  }

  return (
    <div className={PAGE_WRAPPER_CLASSES}>
      <h1 className="text-2xl font-bold">🌐 Partie en Ligne (Matchmaking)</h1>

      {!gameState && !isWaiting ? (
        <button
          className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          onClick={() => joinQueue()}
          disabled={!isConnected}
        >
          {isConnected ? "Rechercher une partie" : "Connexion au serveur..."}
        </button>
      ) : !gameState && isWaiting ? (
        <div className="flex flex-col items-center gap-3 p-8 bg-[#262421] rounded-2xl border border-[#3d3a36]">
          <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          <p className="text-sm text-amber-200 animate-pulse">Recherche d'un adversaire en cours...</p>
        </div>
      ) : (
        <>

          {error && <div className="alert alert-error text-red-400 text-sm">{error}</div>}

          {/* Conteneur principal 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-5xl items-center">
          {/* par exemple si on voulait 7 colomnes pour avoir une board a 600px (= ce qui est defini dans la constante) */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl items-center mt-6"></div> */}

            {/* Colonne de gauche : Board de jeux */}
            <div className={BOARD_COLUMN_CLASSES}>
              <OnlineGameHeader blackScore={blackScore} whiteScore={whiteScore} nextPlayer={gameState?.currentPlayer ?? "BLACK"} players={gameState?.players ?? []} />
              <MyBoard board={currentBoard} validMoves={isFinished ? [] : validMovesIndexes} onCellClick={handleCellClick} />

            {/* moved the button inside the left column wrapper */}
            {!isFinished && (
              <button
                onClick={giveUp}
                className={ACTION_BUTTON_DANGER}
              >
                Abandonner
              </button>
            )}
            </div>

            {/* Colonne de droite : Chat global / d'attente */}
            <div className="flex justify-center lg:justify-end w-full">
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
              navigate("/game");;
            }}
          />
        </>
      )}
    </div>
  );
}