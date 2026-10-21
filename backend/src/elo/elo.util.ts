export const DEFAULT_ELO = 350;
export const K_NEW = 40; 
export const K_DEFAULT = 20;
export const NEW_PLAYER_GAMES = 30;
export const MIN_ELO = 187;   

export type EloScore = 1 | 0.5 | 0;

export function expectedScore(ra: number, rb: number): number {
	return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

export function kFactor(gamesPlayed: number): number {
	return gamesPlayed < NEW_PLAYER_GAMES ? K_NEW : K_DEFAULT;
}

/** Retourne la variation d'Elo (entier) du joueur A. */
export function eloDelta(ra: number, rb: number, scoreA: EloScore, k: number): number {
	return Math.round(k * (scoreA - expectedScore(ra, rb)));
}