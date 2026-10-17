import React from 'react';
import type { Match } from '../../types/profileTypes';
import { MatchRow } from './MatchRow';

interface MatchHistoryProps {
  matches: Match[];
}

export function MatchHistory({ matches }: MatchHistoryProps): React.JSX.Element {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg mb-2">Recent Matches</h2>
        <div className="space-y-2">
          {matches.length === 0 ? (
            <p className="text-base-content/60 text-sm">No matches recorded yet.</p>
          ) : (
            matches.map((match) => (
              <MatchRow key={match.matchId} match={match} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}