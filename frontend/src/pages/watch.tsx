import React from "react";
import { useNavigate } from "react-router";
import Game from "./game";
import type { BoardState } from "../types/gameTypes";
import Board from "../components/Board";


const timeNow : string = "2026-10-16T19:20:00Z"


/* --------------------------------------------------------------------------------------------- */
/*            1. Mock Data: Representing the state before connecting your WebSockets             */
/* --------------------------------------------------------------------------------------------- */

export interface GameState {
  id: string;
  player1: PlayerData;
  player2: PlayerData;
  turn: string;
  spectators: number;
  duration: string;
  status: string;
  endedAt?: string;
  board: BoardState;
}

export interface PlayerData {
  username: string;
  avatarUrl: string;
  color: string;
  score: number;
}

// Helper function that converts a text grid into your BoardState array
const createBoard = (layout: string): BoardState => {
  // Remove all spaces and newlines, then map characters to Cell types
  return layout.replace(/\s+/g, '').split('').map(char => {
    if (char === 'B') return 'BLACK';
    if (char === 'W') return 'WHITE';
    return null;
  });
};

// GAME 2: Early Game (Score: 2 - 2)
const STARTING_BOARD = createBoard(`
  . . . . . . . .
  . . . . . . . .
  . . . B . . . .
  . . . B B . . .
  . . . B W . . .
  . . . . . . . .
  . . . . . . . .
  . . . . . . . .
`);

// GAME 1: Mid-Late Game (Score: Black 20, White 30)
const MID_GAME_BOARD = createBoard(`
  . W W W W W W .
  B B W W W W B .
  B B B W W B B W
  B B B B W B B W
  . W W W W B B B
  . . W W W W W .
  . . . W W B B .
  . . . . . . . .
`);

// GAME 3: Finished Game (Score: Black 40, White 24)
const FINISHED_BOARD_40_24 = createBoard(`
  B B B B B B B B
  B B B B B B B B
  B B B W W W W B
  B B W W W W W B
  B W W W W W W B
  B W W W W W W B
  B B W W W B B B
  B B B B B B B B
`);

// GAME 4: Finished Game (Score: Black 34, White 30)
const FINISHED_BOARD_34_30 = createBoard(`
  W W W W W W W W
  W W W W W W W W
  W W W B B B B B
  W W B B B B B B
  W B B B B B B B
  W B B B B B B B
  W W B B B B W W
  W W W B B B B B
`);

const MOCK_LIVE_GAMES = [
  {
    id: "game-001",
    player1: { username: "Alice_Pro", avatarUrl: "/api/avatars/alice.png", color: "Black", score: 34, },
    player2: { username: "BobTheBuilder", avatarUrl: "/api/avatars/bob.png", color: "White", score: 30 },
    turn: "Black",
    spectators: 12,
    duration: "10:45",
    status: "ongoing",
    endedAt: "n/a",
    board: MID_GAME_BOARD,
  },
  {
    id: "game-002",
    player1: { username: "Charlie", avatarUrl: "/api/avatars/charlie.png", color: "Black", score: 4 },
    player2: { username: "Dave", avatarUrl: "/api/avatars/dave.png", color: "White", score: 1 },
    turn: "White",
    spectators: 3,
    duration: "01:20",
    status: "ongoing",
    endedAt: "n/a",
    board: STARTING_BOARD,
  },
  {
    id: "game-003",
    player1: { username: "Eve_Hacker", avatarUrl: "/api/avatars/eve.png", color: "Black", score: 40 },
    player2: { username: "Frank", avatarUrl: "/api/avatars/frank.png", color: "White", score: 24 },
    turn: "Black",
    spectators: 45,
    duration: "15:30",
    status: "finished",
    endedAt: "2026-10-16T19:15:00Z",
    board: FINISHED_BOARD_40_24,
  },
    {
    id: "game-004",
    player1: { username: "bobby", avatarUrl: "/api/avatars/bobby.png", color: "Black", score: 34 },
    player2: { username: "scylla", avatarUrl: "/api/avatars/scylla.png", color: "White", score: 30 },
    turn: "Black",
    spectators: 32,
    duration: "18:30",
    status: "finished",
    endedAt: "2026-10-16T19:00:00Z",
    board: FINISHED_BOARD_34_30,
  },
];

/* --------------------------------------------------------------------------------------------- */
/*                                 2. COMPONENT PROP INTERFACES                                  */
/* --------------------------------------------------------------------------------------------- */

interface GameCardProps {
  game: GameState;
  onJoin: (gameId: string) => void;
}

interface PlayerProps {
  player: PlayerData;
  turn: string;
}

interface ScoreProps {
  score1: number;
  score2: number;
}

interface StatusProps {
  spectators: number;
  duration: string;
  status: string;
}

interface FooterProps {
  player1: PlayerData;
  player2: PlayerData;
  status: string;
  turn: string;
}

/* --------------------------------------------------------------------------------------------- */
/*                                 3. CHILD COMPONENTS                                           */
/* --------------------------------------------------------------------------------------------- */

// Title component
const Title = (): React.ReactElement => {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-4xl font-bold mb-2">Watch Live</h1>
      <p className="text-lg text-base-content/70">Spectate ongoing Othello matches in real-time.</p>
    </div>
  );
}

// Status component
const Status = ({ spectators, duration, status }: StatusProps): React.ReactElement => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className={`badge gap-2 font-bold ${status === "ongoing" ? "badge" : "badge-neutral"}`}>
        {status === "ongoing" && (
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}

        {status === "ongoing" ? "LIVE" : "FINISHED"}
      </div>
      <div className="text-sm text-base-content/70 flex items-center gap-1">
        {status === "ongoing" ? (
          // if ongoing: show spectators and current duration
        <>
          <span>👁️ {spectators}</span>
          <span className="mx-1">•</span>
          <span>⏱️ {duration}</span>
        </>
        ) : (
          // if finished : hide spectators count, display game total duration
          <span>⏱️ Total Duration: {duration}</span>
        )}
      </div>
    </div>
  );
}

// const BoardPreview = (): React.ReactElement => {
//   return (
//     // The main board wrapper (green background, square aspect ratio)
//     <div className="aspect-square w-full max-w-xs mx-auto bg-green-800 rounded-lg p-1.5 grid grid-cols-8 gap-0.5 mb-6 shadow-inner border-2 border-base-300">

//       {/* Generate 64 squares dynamically */}
//       {Array.from({ length: 64 }).map((_, index) => {
//         // Hardcode the 4 center starting pieces for the visual mockup
//         const isWhite = index === 27 || index === 36;
//         const isBlack = index === 28 || index === 35;

//         return (
//           <div key={index} className="w-full h-full bg-green-600 flex items-center justify-center rounded-sm">
//             {isWhite && <div className="w-4/5 h-4/5 bg-white rounded-full shadow-sm"></div>}
//             {isBlack && <div className="w-4/5 h-4/5 bg-neutral rounded-full shadow-sm border border-neutral-focus"></div>}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// Player component
const Player = ({ player, turn }: PlayerProps): React.ReactElement => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <div className={`avatar ${turn === player.color ? 'online' : ''}`}>
      <div className="w-16 h-16 rounded-full bg-neutral text-neutral-content ring ring-primary ring-offset-base-100 ring-offset-2">
        <img
          src={player.avatarUrl}
          alt={player.username}
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.username}&background=random` }}
        />
      </div>
    </div>
    <span className="font-bold truncate w-full text-center" title={player.username}>
      {player.username}
    </span>
    <span className={`badge badge-sm ${player.color === 'Black' ? 'badge-neutral' : 'badge-outline'}`}>
      {player.color}
    </span>
  </div>
);

// Score component
const Score = ({ score1, score2 }: ScoreProps): React.ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center w-1/3">
      <div className="text-4xl font-black mb-1">
        {score1} <span className="text-base-content/30">-</span> {score2}
      </div>
    </div>
  );
}
// Footer component
const Footer = ({ player1, player2, turn, status }: FooterProps): React.ReactElement => {
  return (
    <div className="mt-6 pt-4 border-t border-base-300 text-center text-sm">
      {status === "ongoing" ? (
        // ongoing: show the turn
        <>Turn: <span className="font-semibold text-primary">{turn === 'Black' ? player1.username : player2.username}</span></>
      ) : player1.score === player2.score ? (
        // tied: draw
        <span className="font=bold text-warning">DRAW</span>
      ) : ( // calculate and show winner
        <span className="font-bold text-success">
          WINNER: {player1.score > player2.score ? player1.username : player2.username}
        </span>
      )}
    </div>
  );
}

const GameCard = ({ game, onJoin}: GameCardProps) : React.ReactElement => {
  return (
    <div
      onClick={() => onJoin(game.id)}
      className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-base-300"
    >
      <div className="card-body p-6">
        {/* Card Header: Live indicator & Stats */}
        <Status spectators={game.spectators} duration={game.duration} status={game.status} />

        <div className="w-full max-w-xs mx-auto mb-6 pointer-events-none">
          <Board
            board={game.board} // Later, replace with game.board
            validMoves={[]}        // Empty array prevents move indicators
            disabled={true}        // Prevents any click interactions
            onMove={() => {}}      // Dummy function since it's disabled
          />
        </div>

        {/* Card Middle: Score and Players Layout */}
        <div className="flex justify-between items-center w-full">
          <Player player={game.player1} turn={game.turn} />
          <Score score1={game.player1.score} score2={game.player2.score} />
          <Player player={game.player2} turn={game.turn} />
        </div>

        {/* Card Footer */}
        <Footer player1={game.player1} player2={game.player2} turn={game.turn} status={game.status} />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------------------------- */
/*                                  4. HELPER FUNCTIONS                                          */
/* --------------------------------------------------------------------------------------------- */

// Helper function to filter games
const getVisibleGames = (games: GameState[], currentTime: string): GameState[] => {
  return games.filter((game) => {
    if (game.status === "ongoing") return true;

    if (game.status === "finished" && game.endedAt) {
      const nowMs = new Date(currentTime).getTime();
      const endedMs = new Date(game.endedAt).getTime();
      const diffInMinutes = Math.floor((nowMs - endedMs) / 60000);
      return diffInMinutes <= 10;
    }

    return false;
  });
}

/* --------------------------------------------------------------------------------------------- */
/*                                  5. MAIN COMPONENTS                                           */
/* --------------------------------------------------------------------------------------------- */

const Watch = (): React.ReactElement => {
  const navigate = useNavigate();

  const handleJoinSpectator = (gameId: string) => {
    // Navigates to the game page. You can pass the gameId in the URL
    navigate(`/game/${gameId}?mode=spectator`);
  };

  const visibleGames = getVisibleGames(MOCK_LIVE_GAMES, timeNow);

  return (
    <div className="container mx-auto px-4 py-8">
      <Title />

      {visibleGames.length === 0 ? (
        <div className="text-center text-xl mt-12">No live games at the moment. Check back later!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Map through the data and render the extracted GameCard */}
          {visibleGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onJoin={handleJoinSpectator}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watch;