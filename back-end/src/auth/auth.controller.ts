import { AuthService } from './auth.service';
import { Body, Controller, Post, Get, UseInterceptors, Res, Req, UnauthorizedException } from '@nestjs/common';
import { RegisterDto, extractUserCreate } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import {  HttpStatus, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from '../common/guards/jwt.guard';
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

	// pose les cookies d'auth sans cookie.interceptor. Uniquement utilisé par les deux callbacks OAuth.
	// Les callbacks se termine par un redirect() donc la reponse n'a pas le temps de passer par CookieInterceptor.
	private setAuthCookies( res: Response, jwt: string, refreshToken: string )
	{
		const	expirationCookieJwt = 1000 * ( 60 + parseInt( this.configService.getOrThrow<string>( 'JWT_EXPIRATION' ), 10 ));
		const	expirationCookieRefreshToken = 1000 * ( 60 + parseInt( this.configService.getOrThrow<string>( 'REFRESH_TOKEN_EXPIRATION' ), 10 ));

		res.cookie( 'access_token', jwt,
		{
			httpOnly:	true,
			secure:		true,
			sameSite:	'lax',
			maxAge:		expirationCookieJwt,
		});

		res.cookie( 'refresh_token', refreshToken,
		{
			httpOnly:	true,
			secure:		true,
			sameSite:	'lax',
			maxAge:		expirationCookieRefreshToken,
		});
	}

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
	async logout( @Req() request, @Res({ passthrough: true }) response: Response )
	{
		// clearCookie "supprime" les cookies: en realité, il set les MaxAge a 1 -> rend instantanément le cookie expiré -> le navigateur le supprime automatiquement 
		response.clearCookie( 'access_token',
		{
			httpOnly:	true,
			secure:		true,
			sameSite:	'lax',
		});

		response.clearCookie( 'refresh_token',
		{
			httpOnly:	true,
			secure:		true,
			sameSite:	'lax',
		});

		return( await this.authService.logout( request.user.id )); // logout set le refreshtoken et son expiration a null et retourne le user logout
	}

	///

	@UseGuards( GoogleGuard ) // GoogleGuard intercepte toutes les requetes arrivantes de googleCall et applique googleStrategy
	@Get( 'google' )
	async googleCall() {}
   
	///

	@UseGuards( GoogleGuard )
	@Get( 'google/callback' )
	async googleCallback( @Req() request, @Res() res: Response ) // @Req: decorateur de parametre -> Passport attache à, soit le retour de validate() soit le retour de done() à request.user
	{
		const	auth = await this.authService.login( request.user ); // stock le retour de login (les deux otken + le userPublic )

		this.setAuthCookies( res, auth.jwt, auth.refreshToken ); // pose deux cookies auth avec les deux token

		res.redirect( HttpStatus.FOUND, `${ this.configService.getOrThrow<string>( 'APP_URL' )}/game` );
	}

	///
	@UseGuards( GitGuard ) // GithubGuard intercepte toutes les requetes arrivantes de GithubCall et applique GithubStrategy
	@Get( 'github' )
	async githubCall() {}

	///

	@UseGuards( GitGuard )
	@Get( 'github/callback' )
	async githubCallback( @Req() request, @Res() res: Response ) // @Req: decorateur de parametre -> Passport(strategy d'auth) attache à, soit le retour de validate() soit le retour de done() à request.user
	{
		const	auth = await this.authService.login( request.user );

		this.setAuthCookies( res, auth.jwt, auth.refreshToken );

		res.redirect( HttpStatus.FOUND, `${ this.configService.getOrThrow<string>( 'APP_URL' )}/game` );
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
			throw new UnauthorizedException( 'no refresh token provided' );

		return( this.authService.login( await this.authService.validateRefreshToken( refreshTokenRaw )));
	}

	///

	@UseGuards( JwtGuard )
	@Get( 'me' )
	async me( @Req() request )
	{
		return ( request.user );
	}
};