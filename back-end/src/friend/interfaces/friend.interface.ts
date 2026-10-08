import { StatusFriendship } from "@prisma/client"

export interface FriendLists
{
	friends:	FriendUser[]
	sent:		FriendUser[]
	received:	FriendUser[]
};

export interface FriendUser
{
	id:			string
	username:	string
	avatarUrl:	string
	elo:		number
};

export interface FriendshipRaw // objet brute -> toutes les relations du user (peu importe le status)
{
	status:		StatusFriendship,
	sender:		FriendUser,
	receiver:	FriendUser
};