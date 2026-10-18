import React from "react";
import { useNavigate } from "react-router";
// import Game from "./game";
import type { BoardState, SpectatorPlayerData, LiveGamePayload } from "../types/gameTypes";
import Board from "../components/Board";
import { useSpectatorSocket } from "../hooks/useSpectatorSocket";


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
  isBot?: boolean;
  board: BoardState;
}

export interface PlayerData {
  username: string;
  avatarUrl: string;
  color: string;
  score: number;
  elo: number;
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
    player1: { username: "Alice_Proooooooooooooooooooooo", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Grandmaster", color: "Black", score: 34, elo: 2450, },
    player2: { username: "BobTheBuilder", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CornerTrapper", color: "White", score: 30, elo: 2310, },
    turn: "Black",
    spectators: 12,
    duration: "10:45",
    status: "IN_PROGRESS",
    endedAt: "2026-10-16T19:15:00Z",
    board: MID_GAME_BOARD,
  },
  {
    id: "game-002",
    player1: { username: "Charlie", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=BlackDisc", color: "Black", score: 4, elo: 2240, },
    player2: { username: "Dave", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Flipper", color: "White", score: 1, elo: 2150, },
    turn: "White",
    spectators: 3,
    duration: "01:20",
    status: "IN_PROGRESS",
    endedAt: "n/a",
    board: STARTING_BOARD,
  },
  {
    id: "game-003",
    player1: { username: "Eve_Hacker", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Reversi", color: "Black", score: 40, elo: 2090, },
    player2: { username: "Frank", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Tactical", color: "White", score: 24, elo: 2010, },
    turn: "Black",
    spectators: 45,
    duration: "15:30",
    status: "FINISHED",
    endedAt: "2026-10-16T19:15:00Z",
    board: FINISHED_BOARD_40_24,
  },
    {
    id: "game-004",
    player1: { username: "bobby", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=NoPass", color: "Black", score: 34, elo: 1980, },
    player2: { username: "scylla", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Edge", color: "White", score: 30, elo: 1920, },
    turn: "Black",
    spectators: 32,
    duration: "18:30",
    status: "FINISHED",
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

interface PlayerRowProps {
  player: PlayerData;
  turn: string;
  status: string;
  isWinner: boolean;
  isDraw: boolean;
}

interface StatusProps {
  spectators: number;
  duration: string;
  status: string;
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
const Status = ({ spectators, duration, status }: StatusProps): React.ReactElement => (
  <>
    {/* Floating Top-Left: LIVE Badge */}
      <div className="absolute top-5 left-5 z-10">
        {/* <div className={`badge border-none shadow-sm font-bold gap-2 ${status === "IN_PROGRESS" ? "badge" : "badge-neutral"}`}> */}
        <div className={`badge border shadow-lg font-bold gap-2 ${
          status === "IN_PROGRESS"
            ? "badge-error text-white border-white/30 shadow-red-500/20"
            : "badge-neutral border-base-content/20 shadow-black/40"
          }`}>
        {status === "IN_PROGRESS" && (
          // <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> // option 1
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> // option 2
        )}
        {status === "IN_PROGRESS" ? "LIVE" : "FINISHED"}
        </div>
      </div>


      {/* Floating Top-Right: Stats */}
      <div className="absolute top-5 right-5 z-10">
      <div className="flex items-center gap-2 bg-base-200/80 backdrop-blur-sm border border-base-content/10 text-base-content text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
        {status === "IN_PROGRESS" ? (
          // if ongoing: show spectators and current duration
        <>
          <span>👀 {spectators}</span>
          <span className="opacity-50">•</span>
          <span>⏳ {duration}</span>
        </>
        ) : (
          // if finished : hide spectators count, display game total duration
          <span>⌛ {duration}</span>
        )}
      </div>
    </div>
  </>
);

const PlayerRowAvatar = ({ player, turn, status } : { player: PlayerData, turn: string, status: string }): React.ReactElement => {
  const isOnline = status === "IN_PROGRESS" && turn === player.color;

  return (
        <div className={`avatar shrink-0 ${isOnline ? 'online' : ''}`}>
          <div className={`w-12 h-12 border-2 rounded-full bg-base-300 ${
            player.color === 'Black'
              ? 'border-black/50'
              : 'border-whit/50'}`}>
            <img
              src={player.avatarUrl}
              alt={player.username}
              onError={(e) => { e.currentTarget.src = '/api/uploads/avatars/default.png' }}
            />
          </div>
        </div>
  );
}

const PlayerRowName = ({ player } : { player: PlayerData }): React.ReactElement => {
  return (
    <div className="flex flex-col min-w-0 flex-1 pr-2">
      <span className="font-bold text-base truncate" title={player.username}>
        {player.username}
      </span>
      <span className="font-mono text-xs text-base-content/60">
        {player.elo}
      </span>
    </div>
  );
}

const PlayerRowDot = ({ player, turn, status } : { player: PlayerData, turn: string, status: string } ): React.ReactElement => {
  const showSpinner = status === "IN_PROGRESS" && turn === player.color;

  return (
    <div className="relative shrink-0 flex items-center justify-center w-8 h-8">
      {showSpinner && (
        <div className="absolute -inset-0.5 rounded-full bg-[conic-gradient(transparent_0deg,rgba(255,255,255,0.7)_360deg)] animate-[spin_3s_linear_infinite]"></div>      )}
      <div
        className={`relative z-10 w-8 h-8 rounded-full shadow-md border border-base-300/30 ${
          player.color === 'Black' ? 'bg-[#1d1d1d] border-1 border-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
          : 'bg-white border border-black/10 shadow-[0_0_8px_rgba(0,0,0,0.4)]'}`}
        title={player.color}
      />
    </div>
  );
}

const PlayerRowScore = ({ player } : {player : PlayerData }): React.ReactElement => {
  return (
    <div className="font-black text-3xl tabular-nums text-right w-12 shrink-0">
      {player.score}
    </div>
  );
}

const PlayerRow = ({ player, turn, status, isWinner, isDraw }: PlayerRowProps): React.ReactElement=> {
const isTurn = status === "IN_PROGRESS" && turn === player.color;

let rowStyle = "opacity-80 border border-transparent";

  if (status === "IN_PROGRESS" && isTurn) {
    // Normal ongoing active turn glow
    rowStyle = "bg-base-100 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 border border-white/10";
  } else if (status === "FINISHED") {
    if (isWinner) {
      // Winner styling: Green tinted background, green border, green glow, full opacity
      rowStyle = "bg-success/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] z-10 border border-success/40 opacity-100";
    } else if (isDraw) {
      // Draw styling: Subtle warning tint
      rowStyle = "bg-warning/5 border border-warning/20 opacity-80";
    } else {
      // Loser styling: Dimmed out so the winner pops
      rowStyle = "opacity-40 border border-transparent";
    }
  }


  return (
    // background highlight for player's turn
    <div className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${rowStyle}`}>

      <div className="flex items-center gap-3 min-w-0 flex-1">
        < PlayerRowAvatar player={player} turn={turn} status={status} />
        < PlayerRowName player={player} />
      </div>

      {isWinner &&
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <span className="badge badge-success border-none font-black text-md tracking-widest uppercase px-5 py-5 shadow-md">
            WINNER
          </span>
        </div>
      }

      <div className="flex items-center justify-end gap-3 shrink-0">
        < PlayerRowDot player={player} turn={turn} status={status} />
        < PlayerRowScore player={player} />
      </div>
    </div>
  );
}

const GameCard = ({ game, onJoin}: GameCardProps) : React.ReactElement => {
  const isFinished = game.status === "FINISHED";
  const isDraw = isFinished && game.player1.score === game.player2.score;
  const winnerColor = isFinished && !isDraw
    ? (game.player1.score > game.player2.score ? game.player1.color : game.player2.color)
    : null;

  return (
    <div
      onClick={() => onJoin(game.id)}
      className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-base-300 overflow-hidden"
      >
        {/* Card Header: Live indicator & Stats */}
        <figure className="relative w-full p-0 border-b border-base-300">
          <Status spectators={game.spectators} duration={game.duration} status={game.status} />

          {/* Board Preview */}
          <div className={`w-full pointer-events-none transition-all duration-700 ${
            game.status === "FINISHED" ? "grayscale[50%] opacity-50" : ""
          }`}>
            <Board
              board={game.board} // Later, replace with game.board
              validMoves={[]}        // Empty array prevents move indicators
              // disabled={true}        // Prevents any click interactions
              onMove={() => {}}      // Dummy function since it's disabled
            />
          </div>
        </figure>

        {/* Card Middle: Score and Players Layout */}
        <div className="card-body p-4 gap-1">
          <PlayerRow
            player={game.player1}
            turn={game.turn}
            status={game.status}
            isWinner={winnerColor === game.player1.color}
            isDraw={isDraw}
          />
          <div className="divider m-0 h-0 opacity-30"></div>
          <PlayerRow player={game.player2}
            turn={game.turn}
            status={game.status}
            isWinner={winnerColor === game.player2.color}
            isDraw={isDraw}
          />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------------------------- */
/*                                  4. HELPER FUNCTIONS                                          */
/* --------------------------------------------------------------------------------------------- */

// Helper function to filter games
const getVisibleGames = (games: GameState[], currentTime: string): GameState[] => {
  return games
    .filter((game) => {
      // 1. Keep all ongoing games
      if (game.status === "IN_PROGRESS") return true;

      // 2. Keep finished game from less than 10min
      if (game.status === "FINISHED" && game.endedAt) {
        const nowMs = new Date(currentTime).getTime();
        const endedMs = new Date(game.endedAt).getTime();
        const diffInMinutes = Math.floor((nowMs - endedMs) / 60000);
        return diffInMinutes <= 10;
      }
      return false;
    })

    .sort((a, b) => {
      // 1. Finished games last
      // if 'a' is ongoing and 'b' is finished, 'a' goes first (-1)
      if (a.status !== b.status) {
        return a.status === "IN_PROGRESS" ? -1 : 1;
      }

      // 2. Bot matches placeholder
      const aIsBot = a.isBot || false;
      const bIsBot = b.isBot || false;
      if (a.status === "IN_PROGRESS" && aIsBot !== bIsBot) {
        return aIsBot ? 1 : -1; // Human (-1) comes before Bot (1)
      }

      // 3. Highest ELO
      const aElo = a.player1.elo + a.player2.elo;
      const bElo = b.player1.elo + b.player2.elo;

      // Sort in descending order (highest ELO first)
      return bElo - aElo;
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
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