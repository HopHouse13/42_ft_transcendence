import { Game } from '@prisma/client';

export interface UserPublic
{
	id:			string
	username:	string
	avatarUrl:	string
	createdAt:	Date
	updatedAt:	Date
};

export interface UserPrivate
{
	id:						string
	username:				string
	email:					string
	avatarUrl:				string
	createdAt:				Date
	updatedAt:				Date

	passwordHash:			string | null
	googleId:				string | null
	gitId:					string | null

	tokenPassword:			string | null
	tokenPasswordExpiresAt:	Date | null
};

export interface UserProfil
{
	id:				string
	username:		string
	email:			string
	avatarUrl:		string
	createdAt:		Date
	updatedAt:		Date

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