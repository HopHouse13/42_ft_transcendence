import React from "react";
import { useNavigate } from "react-router";

// 1. Mock Data: Representing the state before connecting your WebSockets
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

interface ScoreProps {
  score1 : number;
  score2 : number;
}

interface PlayerProps {
  username :   string;
  avatarUrl :  string;
  color :      string;
  turn :       string;
}

interface StatusProps {
  spectators :  number;
  duration :    string;
  status :      string;
}

// Title component
const Title = () : React.ReactElement => {
  return (
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">Watch Live</h1>
        <p className="text-lg text-base-content/70">Spectate ongoing Othello matches in real-time.</p>
      </div>
  );
}

// Score component
const Score = ({ score1, score2 } : ScoreProps) : React.ReactElement => {
  return (
  <div className="flex flex-col items-center justify-center w-1/3">
    <div className="text-4xl font-black mb-1">
      {score1} <span className="text-base-content/30">-</span> {score2}
    </div>
  </div>
  );
}

const Player = ({ username, avatarUrl, color, turn } : PlayerProps) : React.ReactElement => {
  return (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <div className={`avatar ${turn === color ? 'online' : ''}`}>
      <div className="w-16 h-16 rounded-full bg-neutral text-neutral-content ring ring-primary ring-offset-base-100 ring-offset-2">
        {/* Fallback image logic included for development */}
        <img src={avatarUrl} alt={username} onError={(e) => {e.currentTarget.src = `https://ui-avatars.com/api/?name=${username}&background=random`}} />
      </div>
    </div>
    <span className="font-bold truncate w-full text-center" title={username}>{username}</span>
    <span className={`badge badge-sm ${color === 'Black' ? 'badge-neutral' : 'badge-outline'}`}>
      {color}
    </span>  </div>
  );
}

const Status = ({ spectators, duration, status } : StatusProps) : React.ReactElement => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className={`badge gap-2 font-bold ${status === "ongoing" ? "animate-pulse" : "badge-neutral"}`}>
        {status === "ongoing" && (
          <span className="w-2 h-2 bg-white rounded-full"></span>
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
                  {/* Player 1 (Black) */}
                  <Player username={game.player1.username} avatarUrl={game.player1.avatarUrl} color={game.player1.color} turn={game.turn} />
                  {/* Score */}
                  <Score score1={game.player1.score} score2={game.player2.score} />
                  {/* Player 2 (White) */}
                  <Player username={game.player2.username} avatarUrl={game.player2.avatarUrl} color={game.player2.color} turn={game.turn} />
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-base-300 text-center text-sm">
                  Turn: <span className="font-semibold text-primary">{game.turn === 'Black' ? game.player1.username : game.player2.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watch;