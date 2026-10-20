import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";

interface StreamBotGameHeaderProps {
    blackScore: number;
    whiteScore: number;
    nextPlayer: "BLACK" | "WHITE";
}

const StreamBotGameHeader = ({blackScore, whiteScore, nextPlayer}: StreamBotGameHeaderProps): React.ReactElement  => (
    <div className="flex flex-row grow gap-0 w-full items-center mb-2">
        <div className="flex min-w-0 flex-1 justify-start">
            <PlayerCard
                player={{userId: '', color: "BLACK" , connected: false}}
                isTurn={nextPlayer === "BLACK"}
                side={"left"}
                username={"Iago"}
            />
        </div>
        <div className="flex justify-center shrink-0">
            <ScoreCard leftScore={blackScore} rightScore={whiteScore}/>
        </div>
        <div className="flex min-w-0 flex-1 justify-end">
            <PlayerCard
                player={{userId: '', color: "WHITE", connected: false}}
                isTurn={nextPlayer === "WHITE"}
                side={"right"}
                username="Desdemona"
            />
        </div>
    </div>
);

export default StreamBotGameHeader;