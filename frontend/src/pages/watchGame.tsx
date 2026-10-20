import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import MyBoard from '../components/Board';
import SpectatorGameHeader from '../components/SpectatorGameHeader';
import type { LiveGamePayload, Cell } from '../types/gameTypes';
import { useSpectatorSocket } from '../hooks/useSpectatorSocket';
import { PAGE_WRAPPER_CLASSES, BOARD_COLUMN_CLASSES } from "../constants/layoutConstants";


/* --------------------------------------------------------------------------------------------- */
/*                                    COMPONENT PROP INTERFACES                                  */
/* --------------------------------------------------------------------------------------------- */

interface SpectatorBoardProps {
  gameState: LiveGamePayload;
  currentBoard: Cell[];
  isFinished: boolean;
  onBack: () => void;
}

/* --------------------------------------------------------------------------------------------- */
/*                                    CHILD COMPONENTS                                           */
/* --------------------------------------------------------------------------------------------- */

const SpectatorBoard = ({ gameState, currentBoard, isFinished, onBack }: SpectatorBoardProps): React.ReactElement => {
  return (
    <div className={BOARD_COLUMN_CLASSES}>
      {isFinished && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm pointer-events-none">
          <span className="badge badge-error px-6 py-4 text-2xl font-black shadow-2xl">
            MATCH FINISHED
          </span>
        </div>
      )}

      <SpectatorGameHeader
        player1={gameState.player1}
        player2={gameState.player2}
        nextPlayer={gameState.currentPlayer}
      />

      <div className={`w-full pointer-events-none ${isFinished ? "grayscale-[50%] opacity-80" : ""}`}>
        <MyBoard
          board={currentBoard}
          validMoves={[]} // disable move hints
          onCellClick={() => {}} // disable click interactions
        />
      </div>
      <button
        onClick={onBack}
        className="px-3 py-2.5 bg-base-200 hover:bg-base-300 text-base-content/80 border border-base-300 rounded-lg text-sm font-semibold transition-all shadow-sm w-full mt-2"
      >
        ⬅️ Back to Watch List
      </button>
    </div>
  );
};

const ChatCard = () : React.ReactElement => {
  return (
    <div className="flex justify-center md:justify-end w-full h-full min-h-[400px]">
      <div className="w-full h-full rounded-xl bg-base-200 border border-base-300 flex items-center justify-center">
        <p className="text-base-content/50 font-bold">
          Spectator chat coming soon...
        </p>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------------------------- */
/*                                     MAIN COMPONENT                                            */
/* --------------------------------------------------------------------------------------------- */

export default function WatchGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // grab the game data passed silently from the /watch page
  const initialGameData = location.state?.gameData as LiveGamePayload | undefined;

  // keep a background socket running
  const { liveGames, isLoaded } = useSpectatorSocket();

  // if the socket has our game, use the fresh socket data
  // if the socket is still connecting, fall back to the initial data
  const gameState = liveGames.find((g) => g.gameId === gameId) || initialGameData;

  useEffect(() => {
    if (isLoaded && !gameState) {
      navigate('/notFound', { replace: true });
    }
  }, [isLoaded, gameState, navigate]);
  if (!gameId) return <div>Invalid Game ID</div>
  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
        <p className="text-xl">Loading live feed...</p>
      </div>
    )
  };

  // format the backend ServerCell[] into the Cell[] expected by MyBoard
  const currentBoard = gameState.board.map((cell) => (cell === 'EMPTY' ? null : cell));
  const isFinished = gameState.status === 'FINISHED';

  return (
    <div className={PAGE_WRAPPER_CLASSES}>
      <h1 className="text-2xl font-bold w-full max-w-5xl text-left mb-2">
        👀 Spectator Mode
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl items-center mt-6">
        <SpectatorBoard
          gameState={gameState}
          currentBoard={currentBoard}
          isFinished={isFinished}
          onBack={() => navigate('/watch')}
        />
        <ChatCard />
      </div>
    </div>
  );
}