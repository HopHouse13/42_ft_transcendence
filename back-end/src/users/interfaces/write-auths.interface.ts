import { AuthMode } from '@prisma/client'; // AuthMode est objet généré par Prisma à partir de l'enum du schema

// discriminated union : chaque variante représente la donnée d'auth pour un authMode précis
// authMode sert de "discriminant": si LOCAL -> passwordHash ; si GOOGLE ou AUTH42 -> providerId

export interface LocalAuthData
{
	authMode:		typeof AuthMode.LOCAL // typeof AuthMode.LOCAL -> extrait le type littéral 'LOCAL' depuis l'objet généré parle client prisma (avec le schema)
	passwordHash:	string
};

export interface GoogleAuthData
{
	authMode:		typeof AuthMode.GOOGLE
	providerId:		string
};

export interface Auth42AuthData
{
	authMode:		typeof AuthMode.AUTH42
	providerId:		string
};

// union des 3 variantes -> un AuthData est TOUJOURS l'une des 3 formes ci-dessus
export type AuthData = LocalAuthData | GoogleAuthData | Auth42AuthData;

// "Ïnterface" décrit juste la forme d'un objet.
// "Type" fait pareil MAIS sait en plus faire des unions (A | B) et intersections (A & B)
