import { AuthService } from './auth.service';
import { Body, Controller, Post, Get } from '@nestjs/common';
import { RegisterDto, extractUserCreate } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleGuard } from '../common/guards/google.guard';
import { UseGuards } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller( 'auth' )
export class AuthController
{
	constructor( private authService : AuthService ) {};

	///

	@Post( 'register' )
	async register( @Body() dto: RegisterDto )
	{
		return( this.authService.localRegister( await extractUserCreate( dto ) ));
	}

	///

	@Post( 'login' )
	async login( @Body() dto: LoginDto )
	{
		return( this.authService.login( await this.authService.validateUser( dto.email, dto.password )));
	}

	///

	@UseGuards( GoogleGuard ) // regarder comment ca se connecter a la strat auth google
	@Get( 'google' )
	async googleCall() {}
   
	///

	@UseGuards( GoogleGuard )
	@Get( 'google/callback' )
	async googleCallback( @Req() request ) // @Req: decorateur de parametre -> Passport attache à soit le retour de validate() soit le retour de done() à request.user
	{
		return( this.authService.login( request.user ));
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
		return( this.authService.resetPassword( dto.password, dto.token ));
	}
};



// flux register()
// > validation des regles de format des données entrantes avec validationPipe
// > génération de 2 objets: userData et authData
// > hashage du password
// > création du user dans la db
// > appelle de login() qui lui retourne son JWT ( Jeton Web Token )
// ---
// flux login() (connection a son profil)
// > validation des regles de format de username/password
// > récupération des données du user pour verification dans le db
// > check du mode d'auth

// Si LOCAL (username + password)
// > vérification de l'authenticité du user en comparant le password transmis et son passwordHash de la db
// > génération du contenu d'une partie du JWT avec les données du user (id+username)
// > signature de son JWT (création du token a l'aide de la clé secrète dans .env)
// > retourne son JWT