import React from "react";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard"
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import type { GameHeaderProps, PlayerInfo } from "../types/gameTypes";

const GameHeader = ({ gameState, mode }: GameHeaderProps): React.ReactElement => {
    const { user } = useAuthContext();
    const { profile: myProfile } = useUserProfile();

    const mePlayer = gameState.players.find((p) => p.userId === user?.id);
    const opponent = gameState.players.find((p) => p.userId !== user?.id);
    const isBotGame = mode === 'BOT';

    const { profile: opponentProfile } = useUserProfile(isBotGame ? undefined : opponent?.userId);

    const blackScore = gameState.result
        ? gameState.result.blackCount
        : gameState.cells.filter((c) => c === 'BLACK').length;
    const whiteScore = gameState.result
        ? gameState.result.whiteCount
        : gameState.cells.filter((c) => c === 'WHITE').length;

    const myScore = mePlayer?.color === 'WHITE' ? whiteScore : blackScore;
    const opponentScore = opponent?.color === 'WHITE' ? whiteScore : blackScore;

    const isTurn = (player: PlayerInfo): boolean =>
        !gameState.result && gameState.currentPlayer === player.color;

    function getDisplay(player?: PlayerInfo): { username: string; elo: number | null; avatarUrl: string | null } {
        if (!player)
            return { username: 'Waiting...', elo: null, avatarUrl: null };
        if (player.userId === user?.id)
            return {
                username: user.username,
                elo: myProfile?.user.elo ?? null,
                avatarUrl: user.avatarUrl ? `/api${user.avatarUrl}` : null,
            };
        if (isBotGame || player.userId === opponent?.userId)
            return {
                username: isBotGame ? 'Bothello' : (opponentProfile?.user.username ?? player.userId),
                elo: isBotGame ? null : (opponentProfile?.user.elo ?? null),
                avatarUrl: !isBotGame && opponentProfile?.user.avatarUrl
                    ? `/api${opponentProfile.user.avatarUrl}`
                    : null,
            };
        return { username: player.userId, elo: null, avatarUrl: null };
    }

    return (
        <div className="flex flex-row grow gap-4 w-full items-center">
            <div className="flex min-w-0 flex-1">
                <PlayerCard
                    player={mePlayer ?? { userId: '', color: 'BLACK', connected: false }}
                    isTurn={mePlayer ? isTurn(mePlayer) : false}
                    side={'left'}
                    {...getDisplay(mePlayer)}
                />
            </div>
            <div className="flex justify-center shrink-0">
                <ScoreCard
                    leftScore={myScore}
                    rightScore={opponentScore}
                />
            </div>
            <div className="flex min-w-0 flex-1 justify-end">
                <PlayerCard
                    player={opponent ?? { userId: '', color: 'WHITE', connected: false }}
                    isTurn={opponent ? isTurn(opponent) : false}
                    side={'right'}
                    {...getDisplay(opponent)}
                />
            </div>
        </div>
    )
}

export default GameHeader