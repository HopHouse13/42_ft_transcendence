import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import { Payload } from './interfaces/payload.interface';
import { createHash, randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { UserPublic, UserPrivate, UserCreate } from '../user/interfaces/user.interface';
import * as argon2 from 'argon2'; // import d'un namespece qui plusieurs exports et que l'on veut regrouper dans un seul objet


//import { PrismaService } from '../prisma/prisma.service'; // la class PrismaService qui encapsule PrismaClient
//import { Prisma } from '@prisma/client'; // Pour obetenir la classe des exception a lever coté prisma

@Injectable()
export class AuthService
{
	constructor( private jwtService: JwtService, private usersService: UsersService, private mailService: MailService, private configService: ConfigService ) {}; // `private` permet de construire un attribut privé a la class

	///

	// localRegister: -> créer le useer -> log le user
	// creste a besoin du password hashé, il est hashé dans dans la fonction d'extration du dto vers userCreate
	async localRegister( userCreate: UserCreate ): Promise< UserPrivate >
	{
		return( await this.usersService.create( userCreate )); // a la fin de l'enregistrement, login() est appelé pour generer un jwt pour le nouveau user, qu'il puisse de connection dans la foulée (auto-log)
	}

	///

	// Construit le payload qui sera encodé dans le JWT. il est composé de l'id et username
	// Signe (génère) le JWT à partir du payload généré et du `SERCRET_JWT` dans .env
	// Retourne un JWT (Jeton Web Token) complet à partir de l'id du user
	// 1 JWT par client et par connection
	async login( user: UserPrivate ): Promise<{ jwt: string, refreshToken: string, userPublic: UserPublic }>
	{
		const	payload: Payload = 
		{
			sub:		user.id,
			username:	user.username
		};
		const	jwt = this.jwtService.sign( payload );

		const	refreshToken = await this.generateRefreshToken( user.id ); // renvoi le refreshToken brute

		const	userPublic: UserPublic =
		{
			id: 		user.id,
    		username: user.username,
    		avatarUrl: user.avatarUrl,
    		createdAt: user.createdAt,
    		updatedAt: user.updatedAt
		};
	
		return({ jwt, refreshToken, userPublic });
	}

	///

	// methode a modifier lors de l'integration des OAuth, gere pour le moment uniauement la connection LOCAL
	// Méthode appelé lors de la connection du user
	async validateUser( email: string, password: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate | null = await this.usersService.findByEmail( email );

		if ( !user )
			throw new UnauthorizedException( 'invalid user or email or password' );

		if ( !user.passwordHash ) // doit etre géré: le cas que le user existe mais il n a pas de password (me le rapeller dans la todo)
			throw new UnauthorizedException( 'invalid user or email or password' );

		const	isValid = await argon2.verify( user.passwordHash, password );

		if ( !isValid ) // wrong password
			throw new UnauthorizedException( 'invalid user or email or password' );

		return( user );
	}

	///

	async forgotPassword( email: string ): Promise< { message: string } >
	{
		const	user = await this.usersService.findByEmail( email );
		
		if( user )
		{
			// genere un buffer de 32 octets puis convertie en hexadecimale dans une string de 64 char
			const	token = randomBytes( 32 ).toString( 'hex' );
			// createHash renvoie un objet qui genere le hash, .update donne ce qu'il faut hasher, .digest formate le resultat (hexadecimale la) 
			const	passwordToken  = createHash( 'sha256' ).update( token ).digest( 'hex' );
			// extraction de la variable d'env de la durée de validation du token
			const	expirationSeconds = parseInt( this.configService.getOrThrow<string>( 'PASSWORD_TOKEN_EXPIRATION' ), 10 );
			// +10min - Date exprime le temps en milliseconde
			const	passwordTokenExpiresAt = new Date( Date.now() + expirationSeconds * 1000 );
		
			// set le passwordToken et son expiration dans le user trouvé
			await this.usersService.setPasswordToken( user.id , passwordToken, passwordTokenExpiresAt );

			const	resetLink = `${this.configService.getOrThrow<string>( 'RESET_EMAIL_URL' )}/reset-password?token=${ token }`; // creation du link pour reset le password
		
			await this.mailService.sendResetPasswordEmail( user.email, resetLink ); // envoi du mail
		}

		return( { message: 'If this account exists, an email has been sent' } );
	}

	///

	async resetPassword( password: string, token: string )
	{
		// genere le hash avec le meme algo, au meme format avec le token transmit.
		const	tokenHashClient = createHash( 'sha256' ).update( token ).digest( 'hex' );

		// recherche le user avec le meme token hashé
		const 	user = await this.usersService.findByPasswordToken( tokenHashClient );

		if ( !user || !user.passwordTokenExpiresAt || new Date() > user.passwordTokenExpiresAt )
			throw new UnauthorizedException( 'invalid or expired token' );

		// passe l'id et le password hashé dans la foulée
		const	updateUser = await this.usersService.setPassword( user.id, await argon2.hash( password ));
	
		// si tout est bon, retourne le userPrivate pour le log
		return( updateUser );
	}

	///

	async generateRefreshToken( id: string ): Promise< string >
	{
		const	token = randomBytes( 32 ).toString( 'hex' );
		const	refreshToken = createHash( 'sha256' ).update( token ).digest( 'hex' );

		const	expirationSeconds = parseInt( this.configService.getOrThrow<string>( 'REFRESH_TOKEN_EXPIRATION' ), 10 );
		const	refreshTokenExpiresAt = new Date( Date.now() + expirationSeconds * 1000 ); // Date.now() (millisecondes) donc faut passer expirationSeconds en millisecondes

		await this.usersService.setRefreshToken( id, refreshToken, refreshTokenExpiresAt );

		return( token ); // le token BRUT part dans le cookie
	}

	///

	async validateRefreshToken( refreshTokenRaw: string ): Promise< UserPrivate >
	{
		const	refreshTokenHash = createHash( 'sha256' ).update( refreshTokenRaw ).digest( 'hex' );

		const	user = await this.usersService.findByRefreshToken( refreshTokenHash );

		if( !user || !user.refreshTokenExpiresAt || new Date() > user.refreshTokenExpiresAt )
			throw new UnauthorizedException( 'invalid or expired refresh token' );

		return ( user );
	}

	///

	async logout( userId: string ): Promise< UserPublic >
	{
		return( await this.usersService.clearRefreshToken( userId ));
	}
};
