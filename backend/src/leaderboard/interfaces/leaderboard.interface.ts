export interface Leaderboard
{
	topUsers:		UserLeaderboard[];
	currentUser?:	UserLeaderboard;
}

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