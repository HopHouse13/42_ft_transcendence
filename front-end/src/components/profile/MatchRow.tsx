import React from 'react';
import { Link } from 'react-router-dom';
import type { Match, MatchResult } from '../../types/profileTypes';

interface MatchRowProps {
  match: Match;
}

export function MatchRow({ match }: MatchRowProps): React.JSX.Element {
  const resultBadgeConfig: Record<MatchResult, { text: string; className: string }> = {
    WIN: { text: 'Victory', className: 'badge-success' },
    LOSS: { text: 'Defeat', className: 'badge-error' },
    DRAW: { text: 'Draw', className: 'badge-warning' },
  };

  const badge = resultBadgeConfig[match.result];
  const isWin = match.result === 'WIN';
  const isLoss = match.result === 'LOSS';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-base-100 hover:bg-base-300 transition-colors border border-base-300">
      <div className="flex items-center gap-3">
        <span className={`badge ${badge.className} badge-sm font-semibold`}>
          {badge.text}
        </span>
        <div>
          <span className="text-sm font-medium">vs {match.opponent.username}</span>
          <span className="text-xs opacity-60 ml-2">({match.opponent.elo} Elo)</span>
        </div>
      </div>

      <div className="text-sm font-bold tracking-wider">
        <span className={isWin ? 'text-success' : 'text-base-content'}>
          {match.score.user}
        </span>
        <span className="opacity-40 mx-1.5">-</span>
        <span className={isLoss ? 'text-error' : 'text-base-content'}>
          {match.score.opponent}
        </span>
      </div>

      <Link 
        to={`/replay/${match.matchId}`} 
        className="btn btn-ghost btn-xs text-primary"
      >
        Replay
      </Link>
    </div>
  );
}