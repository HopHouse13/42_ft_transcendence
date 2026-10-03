import type React from "react"
import type { ScoreCardProps } from "../types/gameTypes"

const ScoreCard = ({ leftScore, rightScore }: ScoreCardProps): React.ReactElement => {
    return (
        <div className="card card-md bg-base-100 flex flex-row justify-center items-center gap-2 m-2 p-2">
            <p className="text-xl font-bold tabular-nums" title="your score">
                {leftScore}
            </p>
            <p className="text-xl font-bold opacity-40">-</p>
            <p className="text-xl font-bold tabular-nums" title="opponent score">
                {rightScore}
            </p>
        </div>
    )
}

export default ScoreCard
