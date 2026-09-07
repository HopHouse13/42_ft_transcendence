import { AuthService } from "./auth.service";
import { Body, Controller, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller( 'auth' )
export class AuthController
{
	constructor( private authService : AuthService ) {};

	///

	@Post( 'register' )
	register( @Body() dto: RegisterDto )
	{
		return ( this.authService.register( dto ) );
	}

	@Post( 'login' )
	async login( @Body() dto: LoginDto )
	{
		return ( this.authService.login( await this.authService.validateUser( dto.username, dto.password ) ) );
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