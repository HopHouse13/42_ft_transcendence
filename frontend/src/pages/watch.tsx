import React from "react";
import { useNavigate } from "react-router";


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
}

export interface PlayerData {
  username: string;
  avatarUrl: string;
  color: string;
  score: number;
}

const MOCK_LIVE_GAMES = [
  {
    id: "game-001",
    player1: { username: "Alice_Pro", avatarUrl: "/api/avatars/alice.png", color: "Black", score: 34 },
    player2: { username: "BobTheBuilder", avatarUrl: "/api/avatars/bob.png", color: "White", score: 30 },
    turn: "Black",
    spectators: 12,
    duration: "10:45",
    status: "ongoing",
  },
  {
    id: "game-002",
    player1: { username: "Charlie", avatarUrl: "/api/avatars/charlie.png", color: "Black", score: 2 },
    player2: { username: "Dave", avatarUrl: "/api/avatars/dave.png", color: "White", score: 2 },
    turn: "White",
    spectators: 3,
    duration: "01:20",
    status: "ongoing",
  },
  {
    id: "game-003",
    player1: { username: "Eve_Hacker", avatarUrl: "/api/avatars/eve.png", color: "Black", score: 40 },
    player2: { username: "Frank", avatarUrl: "/api/avatars/frank.png", color: "White", score: 24 },
    turn: "Black",
    spectators: 45,
    duration: "15:30",
    status: "finished",
  }
];

/* --------------------------------------------------------------------------------------------- */
/*                                 2. COMPONENT PROP INTERFACES                                  */
/* --------------------------------------------------------------------------------------------- */

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
        <span>👁️ {spectators}</span>
        <span className="mx-1">•</span>
        <span>⏱️ {duration}</span>
      </div>
    </div>
  );
}

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

/* --------------------------------------------------------------------------------------------- */
/*                                  4. MAIN COMPONENTS                                           */
/* --------------------------------------------------------------------------------------------- */


const Watch = (): React.ReactElement => {
  const navigate = useNavigate();

  const handleJoinSpectator = (gameId: string) => {
    // Navigates to the game page. You can pass the gameId in the URL
    navigate(`/game/${gameId}?mode=spectator`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title />
      {MOCK_LIVE_GAMES.length === 0 ? (
        <div className="text-center text-xl mt-12">No live games at the moment. Check back later!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_LIVE_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => handleJoinSpectator(game.id)}
              className="card bg-base-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-base-300"
            >
              <div className="card-body p-6">
                {/* Card Header: Live indicator & Stats */}
                <Status spectators={game.spectators} duration={game.duration} status={game.status} />

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
          ))}
        </div>
      )}
    </div>
  );
};

export default Watch;