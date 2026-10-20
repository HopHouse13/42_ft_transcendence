import React from "react";
import { useNavigate } from "react-router";
// import Game from "./game";
import type { SpectatorPlayerData, LiveGamePayload } from "../types/gameTypes";
import MyBoard from "../components/Board";
import { useSpectatorSocket } from "../hooks/useSpectatorSocket";


// const timeNow : string = "2026-10-16T19:20:00Z"

/* --------------------------------------------------------------------------------------------- */
/*                                    COMPONENT PROP INTERFACES                                  */
/* --------------------------------------------------------------------------------------------- */

interface GameCardProps {
  game: LiveGamePayload;
  onJoin: (gameId: string) => void;
}

interface PlayerRowProps {
  player: SpectatorPlayerData;
  turn: 'BLACK' | 'WHITE';
  status: string;
  isWinner: boolean;
  isDraw: boolean;
}

interface StatusProps {
  spectators: number;
  startedAt: string;
  duration: string;
  status: string;
}

/* --------------------------------------------------------------------------------------------- */
/*                                    CHILD COMPONENTS                                           */
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
const Status = ({ spectators, startedAt, duration, status }: StatusProps): React.ReactElement => {
  const [liveTimer, setLiveTimer] = React.useState("00:00");

  React.useEffect(() => {
    // only run the ticker if the game is actively in progress
    if (status != "IN_PROGRESS") return;

    const updateTimer = () => {
      const startMs = new Date(startedAt).getTime();
      const diffInSeconds = Math.floor((Date.now() - startMs) / 1000);

      const m = Math.floor(diffInSeconds / 60).toString().padStart(2, '0');
      const s = (diffInSeconds % 60).toString().padStart(2, '0');
      setLiveTimer(`${m}:${s}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000); // tick every 1000ms

    // clean up
    return () => clearInterval(interval);
  }, [startedAt, status]);


  return (
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
            <span>⏳ {liveTimer}</span>
          </>
          ) : (
            // if finished : hide spectators count, display game total duration
            <span>⌛ {duration}</span>
          )}
        </div>
      </div>
    </>
  );
};

/* --------------------------------------------------------------------------------------------- */
/*                                 Player row (sub)components                                    */
const PlayerRowAvatar = ({ player, turn, status } : { player: SpectatorPlayerData, turn: string, status: string }): React.ReactElement => {
  const isOnline = status === "IN_PROGRESS" && turn === player.color;

  return (
        <div className={`avatar shrink-0 ${isOnline ? 'online' : ''}`}>
          <div className={`w-12 h-12 border-2 rounded-full bg-base-300 ${
            player.color === 'BLACK'
              ? 'border-black/50'
              : 'border-white/50'}`}>
            <img
              src={player.avatarUrl}
              alt={player.username}
              onError={(e) => { e.currentTarget.src = '/api/uploads/avatars/default.png' }}
            />
          </div>
        </div>
  );
}

const PlayerRowName = ({ player } : { player: SpectatorPlayerData }): React.ReactElement => {
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

const PlayerRowDot = ({ player, turn, status } : { player: SpectatorPlayerData, turn: string, status: string } ): React.ReactElement => {
  const showSpinner = status === "IN_PROGRESS" && turn === player.color;

  return (
    <div className="relative shrink-0 flex items-center justify-center w-8 h-8">
      {showSpinner && (
        <div className="absolute -inset-0.5 rounded-full bg-[conic-gradient(transparent_0deg,rgba(255,255,255,0.7)_360deg)] animate-[spin_3s_linear_infinite]"></div>      )}
      <div
        className={`relative z-10 w-8 h-8 rounded-full shadow-md border border-base-300/30 ${
          player.color === 'BLACK' ? 'bg-[#1d1d1d] border-1 border-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
          : 'bg-white border border-black/10 shadow-[0_0_8px_rgba(0,0,0,0.4)]'}`}
        title={player.color}
      />
    </div>
  );
}

const PlayerRowScore = ({ player } : {player : SpectatorPlayerData }): React.ReactElement => {
  return (
    <div className="font-black text-3xl tabular-nums text-right w-12 shrink-0">
      {player.score}
    </div>
  );
}
/* --------------------------------------------------------------------------------------------- */

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
  const formattedBoard = game.board.map(cell => cell === 'EMPTY' ? null : cell);

  return (
    <div
      onClick={() => onJoin(game.gameId)}
      className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-base-300 overflow-hidden"
      >
        {/* Card Header: Live indicator & Stats */}
        <figure className="relative w-full p-0 border-b border-base-300">
          <Status
            spectators={game.spectators}
            startedAt={game.startedAt}
            duration={game.duration}
            status={game.status}
          />

          {/* Board Preview */}
          <div className={`w-full pointer-events-none transition-all duration-700 ${
            game.status === "FINISHED" ? "grayscale[50%] opacity-50" : ""
          }`}>
            <MyBoard
              board={formattedBoard} // Later, replace with game.board
              validMoves={[]}        // Empty array prevents move indicators
              onCellClick={() => {}} // Prevents any click interactions
            />
          </div>
        </figure>

        {/* Card Middle: Score and Players Layout */}
        <div className="card-body p-4 gap-1">
          <PlayerRow
            player={game.player1}
            turn={game.currentPlayer}
            status={game.status}
            isWinner={winnerColor === game.player1.color}
            isDraw={isDraw}
          />
          <div className="divider m-0 h-0 opacity-30"></div>
          <PlayerRow player={game.player2}
            turn={game.currentPlayer}
            status={game.status}
            isWinner={winnerColor === game.player2.color}
            isDraw={isDraw}
          />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------------------------- */
/*                                     HELPER FUNCTIONS                                          */
/* --------------------------------------------------------------------------------------------- */

// Helper function to filter games
const getVisibleGames = (games: LiveGamePayload[]/* , currentTime: string */): LiveGamePayload[] => {
  return [...games]
    // .filter((game) => {
    //   // // 1. Keep all ongoing games
    //   // if (game.status === "IN_PROGRESS") return true;

    //   // // 2. Keep finished game from less than 10min
    //   // if (game.status === "FINISHED" && game.endedAt) {
    //   //   const nowMs = new Date(currentTime).getTime();
    //   //   const endedMs = new Date(game.endedAt).getTime();
    //   //   const diffInMinutes = Math.floor((nowMs - endedMs) / 60000);
    //   //   return diffInMinutes <= 10;
    //   // }
    //   // return false;
    //   //
    // })

    .sort((a, b) => {
      // 1. Finished games last
      if (a.status !== b.status) {
        return a.status === "IN_PROGRESS" ? -1 : 1;
        // if 'a' is ongoing and 'b' is finished, 'a' goes first (-1)
      }

      // 2.Human games before bot games
      const aIsBot = a.isBot || false;
      const bIsBot = b.isBot || false;
      if (a.status === "IN_PROGRESS" && aIsBot !== bIsBot) {
        return aIsBot ? 1 : -1; // Human (-1) comes before Bot (1)
      }

      // 3. Highest ELO
      const aElo = a.player1.elo + a.player2.elo;
      const bElo = b.player1.elo + b.player2.elo;
      if (bElo !== aElo) return bElo - aElo; // Sort in descending order

      // 4. Newest game first (if elo tie-break)
      const aTime = new Date(a.startedAt).getTime();
      const bTime = new Date(b.startedAt).getTime();
      if (bTime !== aTime) return bTime - aTime;

      // 5. UUID fallback (if startedAt tie-break)
      return a.gameId.localeCompare(b.gameId);
    });
}

/* --------------------------------------------------------------------------------------------- */
/*                                     MAIN COMPONENT                                            */
/* --------------------------------------------------------------------------------------------- */

const Watch = (): React.ReactElement => {
  const navigate = useNavigate();

  // connect to the WebSocket and fetch data
  const { liveGames } = useSpectatorSocket();

  const handleJoinSpectator = (gameId: string) => {
    // find the game payload from the preview list
    const selectedGame = liveGames.find(g => g.gameId === gameId);

    // Navigates to the game page. You can pass the gameId in the URL
    navigate(`/watch/${gameId}`, { state: { gameData: selectedGame } });
  };

  const visibleGames = getVisibleGames(liveGames);

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
              key={game.gameId}
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