import { useAuthSession } from "../hooks/useAuthSession";
import { useUserProfile } from "../hooks/useUserProfile";
import type { PlayerInfo } from "../types/gameTypes";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";

interface OnlineGameHeaderProps {
    blackScore: number;
    whiteScore: number;
    nextPlayer: "BLACK" | "WHITE";
    players: PlayerInfo[];
}

const OnlineGameHeader = ({blackScore, whiteScore, nextPlayer, players}: OnlineGameHeaderProps): React.ReactElement  => {
    const { user } = useAuthSession();

    const { profile: myProfile } = useUserProfile();

    const mePlayer = players.find((p) => p.userId === user?.id);
    const opponent = players.find((p) => p.userId !== user?.id);

    const { profile: opponentProfile } = useUserProfile(opponent?.userId);

    function getDisplay(player?: PlayerInfo): { username: string; elo: number | null; avatarUrl: string | null } {
        if (!player)
            return { username: 'Waiting...', elo: null, avatarUrl: null };
        if (player.userId === user?.id)
            return {
                username: user.username,
                elo: myProfile?.user.elo ?? null,
                avatarUrl: `${user.avatarUrl}`,
            };
        if (player.userId === opponent?.userId)
            return {
                username: (opponentProfile?.user.username ?? player.userId),
                elo: (opponentProfile?.user.elo ?? null),
                avatarUrl: opponentProfile?.user.avatarUrl ?? null,
            };
        return { username: player.userId, elo: null, avatarUrl: null };
    };

    return (
        <div className="flex flex-row grow gap-0 w-full items-center mb-2">
            <div className="flex min-w-0 flex-1 justify-start">
                <PlayerCard
                    player={mePlayer ?? { userId: '', color: 'BLACK', connected: false }}
                    isTurn={nextPlayer === mePlayer?.color}
                    side={"left"}
                    {...getDisplay(mePlayer)}
                />
            </div>
            <div className="flex justify-center shrink-0">
                {mePlayer?.color === "WHITE"
                    ? <ScoreCard leftScore={blackScore} rightScore={whiteScore}/>
                    : <ScoreCard leftScore={whiteScore} rightScore={blackScore}/>
                }
            </div>
            <div className="flex min-w-0 flex-1 justify-end">
                <PlayerCard
                    player={opponent?? { userId: '', color: 'WHITE', connected: false }}
                    isTurn={nextPlayer === opponent?.color}
                    side={"right"}
                    {...getDisplay(opponent)}
                />
            </div>
        </div>
    );
};

export default OnlineGameHeader;