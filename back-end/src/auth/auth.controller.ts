import { AuthService } from './auth.service';
import { Body, Controller, Post, Get, UseInterceptors, Res, Req, UnauthorizedException } from '@nestjs/common';
import { RegisterDto, extractUserCreate } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import {  HttpStatus, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from '../common/guards/jwt.guard';
import { SilentJwtGuard } from '../common/guards/silentJwt.guard'; 
import { GoogleGuard } from '../common/guards/google.guard';
import { GitGuard } from '../common/guards/github.guard';
import { CookieInterceptor } from '../common/interceptors/cookie.interceptor';
import type { Response } from 'express';

@UseInterceptors( CookieInterceptor )
@Controller( 'auth' )
export class AuthController
{
	constructor( private authService: AuthService, private configService: ConfigService ) {};

	///

	@Post( 'register' )
	async register( @Body() dto: RegisterDto )
	{
		return( this.authService.login( await this.authService.localRegister( await extractUserCreate( dto ))));
	}

	///

	@Post( 'login' )
	async login( @Body() dto: LoginDto )
	{
		return( this.authService.login( await this.authService.validateUser( dto.email, dto.password )));
	}

	///

	@UseGuards( JwtGuard )
	@Post( 'logout' )
	async logout( @Req() request, @Res({ passthrough: true }) response: Response ) // passthrough: true -> on accède à response (cookies, statut) mais Nest envoie toujours le return dans la reponse
	{
		this.authService.clearTokensCookies( response ); // supprime les deux cookies d'auth

		return( await this.authService.logout( request.user.id )); // logout set le refreshtoken et son expiration a null et retourne le user logout
	}

	///

	@UseGuards( GoogleGuard ) // GoogleGuard intercepte toutes les requetes arrivantes de googleCall et applique googleStrategy
	@Get( 'google' )
	async googleCall() {}
   
	///

	@UseGuards( GoogleGuard )
	@Get( 'google/callback' )
	async googleCallback( @Req() request, @Res() response: Response ) // @Req: decorateur de parametre -> Passport attache à, soit le retour de validate() soit le retour de done() à request.user
	{
		const	auth = await this.authService.login( request.user ); // stock le retour de login (les deux tokens + le userPublic )

		this.authService.setTokensCookies( response, auth.jwt, auth.refreshToken ); // pose deux cookies auth avec les deux token

		response.redirect( HttpStatus.FOUND, `${ this.configService.getOrThrow<string>( 'APP_URL' )}/game` ); // cookiesInterceptor est interompu par la redirection -> on 
	}

	///
	@UseGuards( GitGuard ) // GithubGuard intercepte toutes les requetes arrivantes de GithubCall et applique GithubStrategy
	@Get( 'github' )
	async githubCall() {}

	///

	@UseGuards( GitGuard )
	@Get( 'github/callback' )
	async githubCallback( @Req() request, @Res() response: Response ) // @Req: decorateur de parametre -> Passport(strategy d'auth) attache à, soit le retour de validate() soit le retour de done() à request.user
	{
		const	auth = await this.authService.login( request.user );

		this.authService.setTokensCookies( response, auth.jwt, auth.refreshToken );

		response.redirect( HttpStatus.FOUND, `${ this.configService.getOrThrow<string>( 'APP_URL' )}/game` );
	}

	///

	@Post( 'forgot-password' )
	async forgotPassword( @Body() dto: ForgotPasswordDto )
	{
		return( this.authService.forgotPassword( dto.email ));
	}

	///

	@Post( 'reset-password' )
	async resetPassword( @Body() dto: ResetPasswordDto )
	{
		return( this.authService.login( await this.authService.resetPassword( dto.password, dto.token )));
	}

	///
	
	@Post( 'refresh' )
	async refresh( @Req() request )
	{
		const	refreshTokenRaw = request.cookies?.refresh_token;

		if ( !refreshTokenRaw )
			throw new UnauthorizedException( 'session expired' );

		return( this.authService.login( await this.authService.validateRefreshToken( refreshTokenRaw )));
	}

	///

	// SilentJwtGuard specialement concu pour la route "me". Rend silencieux le guard pour que "me" indiquer au navigateur si il y a une session active, sans lui renvoyer des status d'erreurs
	@UseGuards( SilentJwtGuard )
	@Get( 'me' )
	async me( @Req() request, @Res({ passthrough: true }) reponse: Response )
	{
		if ( !request.user )
		{
			this.authService.clearTokensCookies( reponse ); // clear les cookies dans la reponse
			reponse.status( HttpStatus.NO_CONTENT ); // implemente le statut de notre reponse par un 204
			return;
		}

		return ( request.user ); // renvoie au navigateur de userPublic renvoyé par jwtGuard
	}
};