import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";

// AuthGuard est une fonction "mixin" qui va générer une class intermediaire etendu a JwtGuard configuré pour utiliser 'jwtStrategy'
// JwtGuard intercepte la requête avant qu'elle atteigne le controller, et déclenche la stratégie 'jwt' pour vérifier le token
@Injectable()
export class JwtGuard extends AuthGuard( 'jwtStrategy' )
{
	constructor( private readonly authService: AuthService ) // constructeur pour injecter authService
	{
		super(); // comme JwtGuard a un constructeur et a une classe parent, super() est obligatoire pour pouvoir appeler le constructeur de la calsse parent
	}

	// '@ts-expect-error' serre a indiquer au compilateur TypeScript que c'est ok d'avoir une erreur sur la ligne du dessous
	// l'erreur en question -> override de handleResquest (classe parent généré par AuthGuard) -> signature de handleRequest differrentes avec l'original (async)
	// @ts-expect-error
	async handleRequest( err: any, user: any, info: any, context: ExecutionContext ) // override de la methode de la classe parent (classe qui "sort" de AuthGuard)
	{
		if ( user ) // token validé la callback renvoit le user 
			return ( user );

		if ( !info || ( info.name !== 'TokenExpiredError' && info.message !== 'No auth token' )) // laisse une tentative de refreshToken si le token est expiré ou si le navigateur aurait supprimer le cookie(expiration MaxAge) avec les accesToken
			throw ( err || new UnauthorizedException() );
		
		// Cas où le fail de l'authentification est du a l'expiration du token
		const	req = context.switchToHttp().getRequest(); // recuperation de la request a partir du context Express
		const	refreshTokenRaw = req.cookies?.refresh_token;

		if ( !refreshTokenRaw )
			throw ( new UnauthorizedException( 'session expired' ) ); // refresh_token n'existe pas dnas les cookies del a request

		// le cas ou acces_token est expiré est isolé -> nous pouvons tenté de le regenerer
		const	refreshedTokens = await this.authService.validateRefreshToken( refreshTokenRaw ); // verification de refresh_token
		const	auth = await this.authService.login( refreshedTokens ); // genere deux nouveaux tokens et pose les 2 cookies dans la reponse pour une nouvelle session de 10min
		
		const	res = context.switchToHttp().getResponse();
		this.authService.setTokensCookies( res, auth.jwt, auth.refreshToken ); // genere deux cookies avec les tokens et les pose dans le header de la reponse (res)

		return ( auth.userPublic );
	}

}
 