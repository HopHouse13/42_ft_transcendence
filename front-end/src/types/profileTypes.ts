export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  elo: number;
  rank: number;
  createdAt: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgDisks: number;
}

export interface Opponent {
  username: string;
  elo: number;
}

export interface MatchScore {
  user: number;
  opponent: number;
}

export type MatchResult = 'WIN' | 'LOSS' | 'DRAW';

export interface Match {
  matchId: string;
  opponent: Opponent;
  result: MatchResult;
  score: MatchScore;
  playedAt: string;
}

export interface UserProfileData {
  user: User;
  stats: UserStats;
  recentMatches: Match[];
}