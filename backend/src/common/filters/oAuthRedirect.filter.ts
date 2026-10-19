import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Catch( UnauthorizedException )
export class OAuthRedirectFilter implements ExceptionFilter
{
	constructor( private configService: ConfigService ) {};

	catch( _exception: UnauthorizedException, host: ArgumentsHost ) // host <- nest fournit les arg de la requete (req, res etc)
	{
		const	response = host.switchToHttp().getResponse<Response>();

		response.redirect( HttpStatus.FOUND, `${ this.configService.getOrThrow<string>( 'APP_URL' ) }/connect?error=oauth_failed` );
	};
}

// filter -> intercepte les UnauthorizedException levées sur les routes qui utilisent @UseFilters( OAuthRedirectFilter )
// au lieu du JSON 401 par defaut, redirige ( 302 ) vers le front: /connect?error=oauth_failed