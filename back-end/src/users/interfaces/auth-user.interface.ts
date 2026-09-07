import { AuthMode } from "@prisma/client";

export interface AuthUser
{
	id:				string,
	authMode:		AuthMode,
	passwordHash:	string | null
};