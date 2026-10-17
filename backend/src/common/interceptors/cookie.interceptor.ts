import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class CookieInterceptor implements NestInterceptor // `implements` c'est comme une interface -> ca impose une structure de ta classe
{
	constructor( private readonly authService: AuthService) {}

	intercept( context: ExecutionContext, next: CallHandler ): Observable<any>
	{
		const	res: Response = context.switchToHttp().getResponse(); // récupère l'objet Express qui construira la réponse HTTP finale. Stocké dans res.


		return( next.handle().pipe( // next.hangle represente l'execution du corps de la methode dans le controller
			map(( result: any ) => // pipe est un processus de transformation de chaque observable - map est la premeire et unique brique du pipe, elle renvoie une fonction qui sera appliquer sur chaque observable
			{
				const	{ jwt, refreshToken, userPublic } = result ?? {}; // destructuration

				if( !jwt )
					return ( result );

				this.authService.setTokensCookies( res, jwt, refreshToken ); // pose deux cookies : acces_token et refresh_token dans la reponse de la requete

				return({ userPublic }); // return le resultat de login sans le jwt, ni le refreshToken
			})
		))
	}

};