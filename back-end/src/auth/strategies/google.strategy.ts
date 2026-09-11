import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { Profile } from "passport";
import { UserData } from '../../users/interfaces/write-user.interface';
import { AuthData } from '../../users/interfaces/write-auths.interface';
import { AuthMode, User } from "@prisma/client";

@Injectable()
export class GoogleStrategy extends PassportStrategy( Strategy )
{
	constructor( private configService: ConfigService, private usersService: UsersService )
	{
		super({
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
		const	profileId =	profile.id;
		const	mail =		profile.emails?.at(0)?.value;

		// verification si il google nous a bien transmit l'email
		if ( !mail )
			throw new UnauthorizedException( 'google account has no accessible email' ); // du coup ca annule le processus de register ou du login?
		
		// recupere le user (si il existe) dans la db
		let	user = await this.usersService.findForAuthGoogle( profileId );
		
		// si le user n'existe pas -> creation
		if ( !user )
		{
			const	userData : UserData = {
				username : mail.split( '@' )[0] + '_' + profileId.slice( -4 ),
				email : mail
			};
			const	authData : AuthData = {
				authMode : AuthMode.GOOGLE,
				providerId : profileId
			};

			user = await this.usersService.create( userData, authData );
		}
		done( null, user ); // fonction de callback pour signaler a passport que la verification/creation du user est terminé et voici le user ( pour que request.user soit implementé avec le user )
	}
}