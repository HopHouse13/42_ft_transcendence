import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieInterceptor implements NestInterceptor // `implements` c'est comme une interface -> ca impose une structure de ta classe
{
	constructor( private readonly configService: ConfigService ) {}

	intercept( context: ExecutionContext, next: CallHandler ): Observable<any>
	{
		const	res: Response = context.switchToHttp().getResponse(); // récupère l'objet Express qui construira la réponse HTTP finale. Stocké dans res.

		const	expirationCookieJwt = 1000 * ( 60 + parseInt( this.configService.getOrThrow<string>( 'JWT_EXPIRATION' ), 10 )); // formatage de la durée em millisecondes de la vie du cookies
		const	expirationCookieRefreshToken = 1000 * ( 60 + parseInt( this.configService.getOrThrow<string>( 'REFRESH_TOKEN_EXPIRATION' ), 10 ));

		return( next.handle().pipe( // next.hangle represente l'execution du corps de la methode dans le controller
			map(( result: any ) => // pipe est un processus de transformation de chaque observable - map est la premeire et unique brique du pipe, elle renvoie une fonction qui sera appliquer sur chaque observable
			{
				const	{ jwt, refreshToken, userPublic } = result ?? {}; // destructuration

				if( !jwt )
					return ( result );

				res.cookie( 'access_token', jwt,
				{
					httpOnly:	true, // interdit l'acces du cookie au js
					secure:		true, // only https
					sameSite:	'lax', // accepte le multi source
					maxAge: 	expirationCookieJwt, // 11min
				});

				res.cookie( 'refresh_token', refreshToken,
				{
					httpOnly:	true,
					secure:		true,
					sameSite:	'lax',
					maxAge:		expirationCookieRefreshToken, // 7j et 1min
				});

				return({ userPublic }); // return le resultat de login sans le jwt, ni le refreshToken
			})
		))
	}

};