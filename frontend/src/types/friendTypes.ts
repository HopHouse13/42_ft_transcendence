export interface FriendUser
{
	id:			string
	username:	string
	avatarUrl:	string
	elo:		number
};

export interface FriendLists
{
	friends:	FriendUser[]
	sent:		FriendUser[]
	received:	FriendUser[]
};