import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/write-register.dto';
import { UserData } from '../users/interfaces/write-user.interface';
import { AuthData } from '../users/interfaces/write-auths.interface';
import { AuthMode } from '@prisma/client';
import { Payload } from './interfaces/payload.interface';
import { ForgotPasswordDto } from './dto/write-forgotPassword.dto';
import { createHash, randomBytes } from 'node:crypto';
import { ResetPasswordToken } from './interfaces/resetPassword.interface';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/write-resetPassword.dto';
import * as argon2 from 'argon2'; // import d'un namespece qui plusieurs exports et que l'on veut regrouper dans un seul objet


//import { PrismaService } from '../prisma/prisma.service'; // la class PrismaService qui encapsule PrismaClient
//import { Prisma } from '@prisma/client'; // Pour obetenir la classe des exception a lever coté prisma

@Injectable()
export class AuthService
{
	constructor( private jwtService: JwtService, private usersService: UsersService, private mailService: MailService, private configService: ConfigService ) {}; // `private` permet de construire un attribut privé a la class

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

		return( this.login( newUser.id ) ); // a la fin de l'enregistrement, login() est appelé pour generer un jwt pour le nouveau user, qu'il puisse de connection dans la foulée (auto-log)
	}

	///

	// login() est appelé lors d'une connection apres avoir identifié le user
	// il retourne un JWT (Jeton Web Token) complet a partir de l'id du user
	// 1 JWT par client et par connection
	async login( userId: string ): Promise< string >
	{
		const	payload = await this.buildPayload( userId );
		const	jwt = this.jwtService.sign( payload );
		
		return( jwt );
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

		return( payload );
	}

	///

	// methode a modifier lors de l'integration des OAuth, gere pour le moment uniauement la connection LOCAL
	// Méthode appelé lors de la connection du user
	async validateUser( email: string, password: string ): Promise< string >
	{
		const	user = await this.usersService.findByEmail( email );

		if ( !user || !user.passwordHash ) // !user.passwordHash -> pour garantir a `argon2.verify()` qu'il est bien de type string (et pas null)
			throw new UnauthorizedException( 'invalid user or email' );

		const isValid = await argon2.verify( user.passwordHash, password );

		if ( !isValid )
			throw new UnauthorizedException( 'invalid user or email' );

		return( user.id );
	}

	///

	async forgotPassword( dto: ForgotPasswordDto ): Promise< { message: string } >
	{
		const	user = await this.usersService.findByEmail( dto.email );
		
		if( user )
		{
			const	token = randomBytes( 32 ).toString( 'hex' ); // genere un buffer de 32 octets puis convertie en hexadecimale dans une string de 64 char
			const	tokenHash  = createHash( 'sha256' ).update( token ).digest( 'hex' ); // createHash renvoie un objet qui genere le hash, .update donne ce qu'il faut hasher, .digest formate le resultat (hexadecimale la) 
			const	expiresAt = new Date( Date.now() + 10 * 60 * 1000 ) // Date exprime le temps en milliseconde, la on prend le temps de maintenant + 10min
		
			const	resetPassword: ResetPasswordToken = {
				id: user.id,
				tokenHash,
				expiresAt
			};

			await this.usersService.setResetTokenPassword( resetPassword ); // on stock le hash+l'expiration dans le user dans la db

			const	resetLink = `${this.configService.getOrThrow<string>( 'FRONT_URL' )}/reset-password?token=${ token }`; // creation du link pour reset le password
		
			await this.mailService.sendResetPasswordEmail( user.email, resetLink ); // envoi du mail
		}

		return( { message: 'If this account exists, an email has been sent' } );
	}

	///

	async resetPassword( dto: ResetPasswordDto )
	{
		const	tokenHashClient = createHash( 'sha256' ).update( dto.token ).digest( 'hex' );

		const 	user = await this.usersService.findByResetToken( tokenHashClient );

		if ( !user || !user.tokenPasswordExpiresAt || new Date() > user.tokenPasswordExpiresAt )
			throw new UnauthorizedException( 'invalid or expired token' );

		const	updateUser = await this.usersService.updatePassword( user.id, await argon2.hash( dto.password )); // passe l'id et le password hashé dans la foulée
	
		return( this.login( updateUser.id ) ); // si tout est bon, le user est automatiqument log
	}
};

