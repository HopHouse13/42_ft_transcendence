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

export interface UserProfil extends UserPublic
{
	email: 			string

	gamesAsBlack:	Game[]
	gamesAswhite:	Game[]
	gamesWon:		Game[]
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
	email?:			string
	avatarUrl?:		string
};