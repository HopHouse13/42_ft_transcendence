import { FriendUser } from "./friendUser.interface";

export interface FriendLists
{
	friends:	FriendUser[]
	sent:		FriendUser[]
	received:	FriendUser[]
};