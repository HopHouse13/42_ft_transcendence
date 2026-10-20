import type { AuthUser } from "./authTypes";

export interface LeaderboardUser extends AuthUser {
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}