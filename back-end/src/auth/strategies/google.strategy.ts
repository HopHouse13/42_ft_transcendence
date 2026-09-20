import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../user/users.service';
import { Profile } from 'passport';
import { UserCreate } from '../../user/interfaces/user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy( Strategy )
{
	constructor( private configService: ConfigService, private usersService: UsersService )
	{
		super(
		{
			clientID:		configService.getOrThrow<string>( 'GOOGLE_CLIENT_ID' ),
			clientSecret:	configService.getOrThrow<string>( 'GOOGLE_CLIENT_SECRET' ),
			callbackURL:	configService.getOrThrow<string>( 'GOOGLE_CALLBACK_URL' ),
			scope:			[ 'email', 'profile' ]
		});
	}

	// apres la validation du de authenticité du usergoogle, validation() vérifie si le user existe dans la db sinon creation du user, renvoie du user en callback pour que passport génére request.user pour y avoir acces au niveau du controller
	async	validate( _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback )
	{
		// recuperation des données utiles
		const	googleId =	profile.id;
		const	email =		profile.emails?.at(0)?.value;

		// verification si il google nous a bien transmit l'email
		if ( !email )
			throw new UnauthorizedException( 'google account has no accessible email' ); // du coup ca annule le processus de register ou du login?

		// cas normal : user déjà lié à ce compte Google, retour direct
		let	user = await this.usersService.findByGoogleId( googleId );

		if ( !user )
		{
			// pas encore lié à ce googleId -> peut-être un compte existant par email (LOCAL ou autre)
			user = await this.usersService.findByEmail( email );

			if ( user )
				user = await this.usersService.addGoogleId( user.id, googleId ); // lie le compte existant
			else
			{
				const	dataCreate: UserCreate =
				{
					username:	email.split( '@' )[0] + '_' + googleId.slice( -4 ),
					email,
					googleId
				};

				user = await this.usersService.create( dataCreate ); // vraiment nouveau
			}
		}
		done( null, user ); // fonction de callback pour signaler a passport que la verification/creation du user est terminé et voici le user ( pour que request.user soit implementé avec le user )
	}
}