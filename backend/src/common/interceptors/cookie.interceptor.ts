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
		const	response: Response = context.switchToHttp().getResponse(); // récupère l'objet Express qui construira la réponse HTTP finale. Stocké dans response.

		return( next.handle().pipe( // next.hangle represente l'execution du corps de la methode dans le controller
			map(( result: any ) => // pipe est un processus de transformation de chaque observable - map est la premier et unique brique du pipe, elle renvoie une fonction qui sera appliquer sur chaque observable
			{
				const	{ accessToken, refreshToken, userPublic } = result ?? {}; // destructuration

				if( !accessToken )
					return ( result );

				this.authService.setTokensCookies( response, accessToken, refreshToken ); // set les deux cookies Auth

				return({ userPublic });
			})
		))
	}

};