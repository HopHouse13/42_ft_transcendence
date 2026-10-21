import React from "react";
import PlayerCard from "./PlayerCard";
import ScoreCard from "./ScoreCard";
import type { SpectatorPlayerData } from '../types/gameTypes';

interface SpectatorGameHeaderProps {
  player1: SpectatorPlayerData;
  player2: SpectatorPlayerData;
  nextPlayer: 'BLACK' | 'WHITE'
}

const SpectatorGameHeader = ({ player1, player2, nextPlayer }: SpectatorGameHeaderProps): React.ReactElement => {

  return (
    <div className="flex flex-row grow gap-0 w-full items-center mb-2">
      <div className="flex min-w-0 flex-1 justify-start">
        <PlayerCard
          player={{ userId: player1.username, color: player1.color, connected: true }}
          isTurn={nextPlayer === player1.color}
          side="left"
          username={player1.username}
          elo={player1.elo}
          avatarUrl={player1.avatarUrl}
        />
      </div>

      <div className="flex justify-center shrink-0">
        <ScoreCard leftScore={player1.score} rightScore={player2.score} />
      </div>

      <div className="flex min-w-0 flex-1 justify-end">
        <PlayerCard
          player={{ userId: player2.username, color: player2.color, connected: true }}
          isTurn={nextPlayer === player2.color}
          side="right"
          username={player2.username}
          elo={player2.elo}
          avatarUrl={player2.avatarUrl}
        />
      </div>
    </div>
  );
};

export default SpectatorGameHeader;