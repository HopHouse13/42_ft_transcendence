import { AuthMode } from "@prisma/client";

export interface LocalAuth
{
	id:				string,
	authMode:		AuthMode,
	passwordHash:	string | null
};