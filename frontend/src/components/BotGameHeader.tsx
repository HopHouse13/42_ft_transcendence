import { useAuthSession } from "../hooks/useAuthSession";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";

interface BotGameHeaderProps {
    blackScore: number;
    whiteScore: number;
    myColor: "BLACK" | "WHITE";
    nextPlayer: "BLACK" | "WHITE";
}

const BotGameHeader = ({blackScore, whiteScore, myColor, nextPlayer}: BotGameHeaderProps): React.ReactElement  => {
    const { user } = useAuthSession();
    const botColor = myColor === "BLACK" ? "WHITE" : "BLACK";

    return (
        <div className="flex flex-row grow gap-0 w-full items-stretch mb-2">
            <div className="flex min-w-0 flex-1 justify-start">
                <PlayerCard
                    player={{userId: user?.id ?? '', color: myColor, connected: false}}
                    isTurn={nextPlayer === myColor}
                    side={"left"}
                    username={user?.username ?? "You"}
                    avatarUrl={user?.avatarUrl}
                />
            </div>
            <div className="flex justify-center shrink-0">
                {botColor === "WHITE"
                    ? <ScoreCard leftScore={blackScore} rightScore={whiteScore}/>
                    : <ScoreCard leftScore={whiteScore} rightScore={blackScore}/>
                }
            </div>
            <div className="flex min-w-0 flex-1 justify-end">
                <PlayerCard
                    player={{userId: '', color: botColor, connected: false}}
                    isTurn={nextPlayer === botColor}
                    side={"right"}
                    username="Bothello"
                />
            </div>
        </div>
    );
};

export default BotGameHeader;