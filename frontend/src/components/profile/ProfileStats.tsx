import React from 'react';
import type { UserProfileData } from '../../types/profileTypes';

interface ProfileStatsProps {
  stats: UserProfileData['stats'];
}

export function ProfileStats({ stats }: ProfileStatsProps): React.JSX.Element {
  return (
    <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-200 border border-base-300 w-full">
      <div className="stat text-center sm:text-left">
        <div className="stat-title">Victories</div>
        <div className="stat-value text-success">{stats.wins}</div>
        <div className="stat-desc">{stats.losses} losses / {stats.draws} draws</div>
      </div>

      <div className="stat text-center sm:text-left">
        <div className="stat-title">Win Rate</div>
        <div className="stat-value text-info">{stats.winRate}%</div>
        <div className="stat-desc">Across {stats.totalGames} matches</div>
      </div>

      <div className="stat text-center sm:text-left">
        <div className="stat-title">Avg. Disks</div>
        <div className="stat-value text-secondary">{stats.avgDisks}</div>
        <div className="stat-desc">Disks held at game end</div>
      </div>
    </div>
  );
}