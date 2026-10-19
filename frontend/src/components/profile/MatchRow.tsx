import React from 'react';
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
    <div className="flex flex-row items-center justify-between p-3 rounded-lg bg-base-100 border border-base-300">
      <div className="flex flex-row min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex flex-row min-w-0 gap-2">
          <span className={`badge ${badge.className} badge-sm font-semibold md:hidden`}>{badge.text.at(0)}</span>
          <span className={`badge ${badge.className} badge-sm font-semibold hidden md:flex`}>{badge.text}</span>
          <div className="flex min-w-0 flex-1 items-center">
            <span className="min-w-0 truncate text-sm font-medium">vs {match.opponent.username}</span>
            <span className="ml-2 shrink-0 text-xs opacity-60">({match.opponent.elo} Elo)</span>
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

          <div className="text-xs opacity-60"> 
            <span className="hidden md:inline"> {new Date(match.playedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric', })}</span>
            <span className="md:hidden">  {new Date(match.playedAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', })}</span>
          </div>
      </div>
    </div>
  );
}