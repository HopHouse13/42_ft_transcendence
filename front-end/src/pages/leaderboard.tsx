import React from "react";

interface LeaderboardUser {
  rank: number;
  username: string;
  avatarUrl: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: string;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, username: "Grandmaster_Othello", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Grandmaster", rating: 2450, wins: 182, losses: 24, winRate: "88.3%" },
  { rank: 2, username: "CornerTrapper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Corner", rating: 2310, wins: 154, losses: 31, winRate: "83.2%" },
  { rank: 3, username: "BlackDiscPro", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=BlackDisc", rating: 2240, wins: 140, losses: 38, winRate: "78.6%" },
  { rank: 4, username: "WhiteFlipper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Flipper", rating: 2150, wins: 128, losses: 45, winRate: "74.0%" },
  { rank: 5, username: "ReversiKing", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Reversi", rating: 2090, wins: 115, losses: 42, winRate: "73.2%" },
  { rank: 6, username: "TacticalMind", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Tactical", rating: 2010, wins: 98, losses: 39, winRate: "71.5%" },
  { rank: 7, username: "NoPassNeeded", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=NoPass", rating: 1980, wins: 89, losses: 41, winRate: "68.4%" },
  { rank: 8, username: "EdgeMaster", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Edge", rating: 1920, wins: 82, losses: 44, winRate: "65.0%" },
];

const Leaderboard = (): React.ReactElement => {
  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const restOfPlayers = MOCK_LEADERBOARD.slice(3);

  return (
    <div className="min-h-screen bg-base-100 py-10 px-4 flex justify-center items-center">
      <div className="card w-full max-w-4xl bg-base-200/80 backdrop-blur-md border border-base-300 shadow-2xl rounded-3xl p-6 md:p-10">
        <div className="card-body p-0 flex flex-col gap-8">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <span className="badge badge-neutral badge-outline text-[10px] font-bold tracking-widest uppercase py-2 px-3">
              Hall of Fame
            </span>
            <h1 className="text-4xl font-black text-base-content tracking-tight">
              Top Players
            </h1>
            <p className="text-sm text-base-content/60 max-w-md">
              The highest ranked Othello masters in global matchmaking.
            </p>
          </div>

          {/* Podium (Top 3) */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end my-2">
            {/* Rank 2 - Silver */}
            <div className="card bg-base-300/60 border border-base-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2 relative">
              <span className="badge badge-neutral font-mono font-bold text-xs">#2</span>
              <div className="avatar">
                <div className="w-14 md:w-20 rounded-full ring-2 ring-base-content/20">
                  <img src={topThree[1].avatarUrl} alt={topThree[1].username} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs md:text-sm text-base-content truncate max-w-[100px] md:max-w-none">
                  {topThree[1].username}
                </span>
                <span className="text-xs font-mono text-base-content/70 font-semibold mt-0.5">
                  {topThree[1].rating} ELO
                </span>
              </div>
            </div>

            {/* Rank 1 - Gold */}
            <div className="card bg-base-300 border border-neutral/40 p-5 rounded-2xl flex flex-col items-center text-center gap-2 relative -translate-y-2 shadow-lg shadow-neutral/10">
              <span className="badge badge-neutral font-mono font-black text-xs px-3">🥇 #1</span>
              <div className="avatar">
                <div className="w-16 md:w-24 rounded-full ring-4 ring-neutral">
                  <img src={topThree[0].avatarUrl} alt={topThree[0].username} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-black text-sm md:text-base text-base-content truncate max-w-[120px] md:max-w-none">
                  {topThree[0].username}
                </span>
                <span className="text-xs font-mono text-neutral-content font-extrabold bg-neutral px-2 py-0.5 rounded-md mt-1">
                  {topThree[0].rating} ELO
                </span>
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="card bg-base-300/60 border border-base-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2 relative">
              <span className="badge badge-neutral font-mono font-bold text-xs">#3</span>
              <div className="avatar">
                <div className="w-14 md:w-20 rounded-full ring-2 ring-base-content/20">
                  <img src={topThree[2].avatarUrl} alt={topThree[2].username} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs md:text-sm text-base-content truncate max-w-[100px] md:max-w-none">
                  {topThree[2].username}
                </span>
                <span className="text-xs font-mono text-base-content/70 font-semibold mt-0.5">
                  {topThree[2].rating} ELO
                </span>
              </div>
            </div>
          </div>

          {/* Table (Ranks 4+) */}
          <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-300/40">
            <table className="table w-full text-xs">
              <thead>
                <tr className="border-b border-base-300 text-base-content/60 uppercase font-mono">
                  <th className="w-12 text-center">Rank</th>
                  <th>Player</th>
                  <th className="text-center">Rating</th>
                  <th className="text-center hidden md:table-cell">W / L</th>
                  <th className="text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {restOfPlayers.map((player) => (
                  <tr key={player.rank} className="hover:bg-base-200/50 border-b border-base-300/50 transition-colors">
                    <td className="font-mono font-bold text-center text-base-content/60">
                      #{player.rank}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full bg-base-300">
                            <img src={player.avatarUrl} alt={player.username} />
                          </div>
                        </div>
                        <span className="font-bold text-base-content">
                          {player.username}
                        </span>
                      </div>
                    </td>
                    <td className="text-center font-mono font-bold text-base-content">
                      {player.rating}
                    </td>
                    <td className="text-center font-mono text-base-content/60 hidden md:table-cell">
                      <span className="text-success font-semibold">{player.wins}W</span> / <span className="text-error font-semibold">{player.losses}L</span>
                    </td>
                    <td className="text-right font-mono font-bold text-base-content">
                      {player.winRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Leaderboard;