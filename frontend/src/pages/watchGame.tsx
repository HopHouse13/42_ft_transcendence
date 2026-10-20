import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import MyBoard from '../components/Board';
import OnlineGameHeader from '../components/OnlineGameHeader';
import type { LiveGamePayload } from '../types/gameTypes';
import { useSpectatorSocket } from '../hooks/useSpectatorSocket';


// const HeaderCard

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
  const gameState = liveGames.find(g => g.gameId === gameId) || initialGameData;

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
  const currentBoard = gameState.board.map(cell => cell === 'EMPTY' ? null : cell);
  const isFinished = gameState.status === 'FINISHED';

  const mappedPlayers = [
    { userId: 'player1', color: 'BLACK' as const, connected: true },
    { userId: 'player2', color: 'WHITE' as const, connected: true },
  ];

  return (
    <div className="flex flex-col items-center gap-4 p-6 relative">
      <div className="flex items-center gap-4 w-full max-w-5xl">
        <button className="btn btn-sm btn-ghost" onClick ={() => navigate('/watch')}>
          ← Back to Watch List
        </button>
        <h1 className="text-2xl font-bold">
          👀 Spectating: {gameState.player1.username} vs {gameState.player2.username}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl items-center mt-6">
        {/* game board */}
        <div className="flex flex-col gap-4 shrink-0 relative">

          {isFinished && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm pointer-events-none">
              <span className="badge badge-error px-6 py-4 text-2xl font black shadow-2xl">
                MATCH FINISHED
              </span>
            </div>
          )}

          <OnlineGameHeader
            blackScore={gameState.player1.score}
            whiteScore={gameState.player2.score}
            nextPlayer={gameState.currentPlayer}
            players={mappedPlayers}
          />

          <div className={isFinished ? "graysacale-[50%] opacity-80" : ""}>
            <MyBoard
              board={currentBoard}
              validMoves={[]} // disable move hints
              onCellClick={() => {}} // disable click interactions
            />
          </div>
        </div>

        {/* right column: chat (to be implemented) */}
        < div className="flex justify-center md:justify-end w-full h-full min-h-[400px]">
          <div className="w-full h-full rounded-xl bg-base-200 border border-base-300 flex items-center justify-center">
            <p className="text-base-content/50 font-bold">
              Spectator chat coming soon...
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}