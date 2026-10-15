import type React from "react";
import type { LeaderboardUser } from "../types/leaderboardTypes";
import { useNavigate } from "react-router";

interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUser?: LeaderboardUser;
}

const LeaderboardRow = ({player, isCurrentUser }: {player: LeaderboardUser, isCurrentUser: boolean}) => {
    const navigate = useNavigate();
    return (
        <tr key={player.rank} className="hover:bg-base-200/50 border-b border-base-300/50 transition-colors" onClick={() => navigate(`/profile/${player.id}`)}>
            <td className="font-mono font-bold text-center text-base-content/60">
                {player.rank}
            </td>
            <td>
                <div className="flex items-center gap-3">
                <div className="avatar">
                    <div className="w-8 h-8 rounded-full bg-base-300">
                    <img src={player.avatarUrl} alt={player.username} />
                    </div>
                </div>
                <span className="font-bold text-base-content truncate max-w-30 md:max-w-md">
                    {player.username}
                </span>
                    { isCurrentUser &&
                        // <span className="badge badge-sm badge-soft badge-warning font-bold">
                        <span className="bg-yellow-300/20 rounded-xl px-1.5 text-yellow-400/40 tracking-wide font-bold">
                            You
                        </span>
                    }
                </div>
            </td>
            <td className="text-center font-mono font-bold text-base-content">
                {player.elo}
            </td>
            <td className="text-center font-mono text-base-content/60 hidden md:table-cell">
                <span className="text-success font-semibold">{player.wins}W</span> / <span className="text-error font-semibold">{player.losses}L</span>
            </td>
            <td className="text-center font-mono font-bold text-base-content hidden sm:table-cell">
                {player.winRate}
            </td>
        </tr>
    )
}

const LeaderboardTable = ({users, currentUser}: LeaderboardTableProps): React.ReactElement => {
    return (
        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-300/40">
            <table className="table w-full text-xs">
                <thead>
                <tr className="border-b border-base-300 text-base-content/60 uppercase font-mono">
                    <th className="w-12 text-center">Rank</th>
                    <th className="truncate max-w-">Player</th>
                    <th className="text-center">ELO</th>
                    <th className="text-center hidden md:table-cell">W / L</th>
                    <th className="text-center hidden sm:table-cell">Win Rate</th>
                </tr>
                </thead>
                <tbody>
                {users.map((player) => (
                    <LeaderboardRow player={player} isCurrentUser={player === currentUser} />
                ))}
                {currentUser && currentUser.rank > users.length &&
                    <>
                        { currentUser.rank > users.length + 1  &&
                            <tr>
                                <td colSpan={5} className="md:text-center text-xs tracking-widest text-base-content/40 font-bold font-mono">...</td>
                            </tr>
                        }
                        <LeaderboardRow player={currentUser} isCurrentUser={true} />
                    </>
                }
                </tbody>
            </table>
        </div>
    );
}

export default LeaderboardTable; 