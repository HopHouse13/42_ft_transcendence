import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserData } from '../users/interfaces/write-user.interface';
import { AuthData } from '../users/interfaces/write-auths.interface';
import { AuthMode } from '@prisma/client';
import { Payload } from './interfaces/payload.interface';
import * as argon2 from 'argon2'; // import d'un namespece qui plusieurs exports et que l'on veut regrouper dans un seul objet

//import { PrismaService } from '../prisma/prisma.service'; // la class PrismaService qui encapsule PrismaClient
//import { Prisma } from '@prisma/client'; // Pour obetenir la classe des exception a lever coté prisma

@Injectable()
export class AuthService
{
	constructor( private jwtService: JwtService, private usersService: UsersService ) {}; // `private` permet de construire un attribut privé a la class

	///

	async register( dto: RegisterDto ): Promise< string >
	{
		const	userData: UserData = {
			username:		dto.username,
			email:			dto.email
		};

		const	authData: AuthData = {
			authMode:		AuthMode.LOCAL,
			passwordHash:	await argon2.hash( dto.password ) // argon2 hash le password ici
		};

		const	newUser = await this.usersService.create( userData, authData );

		return ( this.login( newUser.id ) ); // a la fin de l'enregistrement, login() est appelé pour generer un jwt pour le nouveau user, qu'il puisse de connection dans la foulée (auto-log)
	}

	///

	// login() est appelé lors d'une connection apres avoir identifié le user
	// il retourne un JWT (Jeton Web Token) complet a partir de l'id du user
	// 1 JWT par client et par connection
	async login( userId: string ): Promise< string >
	{
		const	payload = await this.buildPayload( userId );
		const	jwt = this.jwtService.sign( payload );
		
		return ( jwt );
	}

	///

	// construit le payload qui sera encodé dans le JWT. il est composé de l'id et sur name du user
	async buildPayload( userId: string ): Promise< Payload >
	{
		const	user = await this.usersService.findOne( userId );

		const	payload: Payload =
		{
			sub:		user.id,
			username:	user.username
		};

		return ( payload );
	}

	///

	// methode a modifier lors de l'integration des OAuth, gere pour le moment uniauement la connection LOCAL
	// Méthode appelé lors de la connection du user
	async validateUser( username: string, password: string ): Promise< string >
	{
		const	authUser = await this.usersService.findForAuthLocal( username );

		if ( !authUser || authUser.authMode !== AuthMode.LOCAL || !authUser.passwordHash ) // !authUser.passwordHash -> pour garantir a `argon2.verify()` qu'il est bien de type string (et pas null)
			throw new UnauthorizedException( 'invalid user' );

		const isValid = await argon2.verify( authUser.passwordHash, password );

		if ( !isValid )
			throw new UnauthorizedException( 'invalid user' );

		return ( authUser.id );
	}

};




