import { Game } from '@prisma/client';

export interface UserPublic
{
	id:			string
	username:	string
	avatarUrl:	string
	createdAt:	Date
	updatedAt:	Date
};

export interface UserPrivate extends UserPublic
{
	email:					string

	passwordHash:			string | null
	googleId:				string | null
	gitId:					string | null

	passwordToken:			string | null
	passwordTokenExpiresAt:	Date | null

	refreshToken:			string | null
	refreshTokenExpiresAt:	Date | null
};

export interface Match
{
	id:				string
	opponentId:		string
	opponentName:	string
	opponentElo: 	number
	result:			'WIN' | 'LOSS' | 'DRAW'
	score:			[ number, number ]
	date:			Date
};


export interface UserProfile extends UserPublic
{
	elo:			number
	matchHistory:	Match[]

};

export interface UserCreate
{
	username:		string
	email:			string

	passwordHash?:	string
	googleId?:		string
	gitId?:			string
};

export interface UserUpdate
{
	username?:		string
	avatarUrl?:		string
};