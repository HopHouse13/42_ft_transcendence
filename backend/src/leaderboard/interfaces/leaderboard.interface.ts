import { Interface } from "readline";


export interface UserLeaderboard
{
	id:			string;
	username:	string;
	avatarUrl:	string;
	elo:		number;
	rank:		number;
	wins:		number;
	losses:		number;
	winRate:	number;
};
//   { id: "a1", rank: 1, username: "Grandmaster_Othello", avatarUrl: "...", elo: 2450, wins: 182, losses: 24, winRate: "88.3%" },
