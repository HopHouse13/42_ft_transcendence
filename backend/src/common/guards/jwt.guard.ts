import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";
import { UserPublic } from "src/user/interfaces/user.interface";

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

		if ( !info || ( info.name !== 'TokenExpiredError' && info.message !== 'No auth token' )) // laisse une tentative de refreshToken si le token est expiré ou si le navigateur aurait supprimer le cookie(expiration MaxAge) avec les accessToken
			throw ( err || new UnauthorizedException() );
		
		// Cas où le fail de l'authentification est du a l'expiration du token
		const	request = context.switchToHttp().getRequest(); // recuperation de la request a partir du context Express
		const	refreshTokenRaw = request.cookies?.refresh_token;

		if ( !refreshTokenRaw )
			throw ( new UnauthorizedException( 'session expired' ) ); // refresh_token n'existe pas dnas les cookies del a request

		// le cas ou acces_token est expiré est isolé -> nous pouvons tenté de le regenerer
		const	userValidated = await this.authService.validateRefreshToken( refreshTokenRaw );
		const	jwt = this.authService.generateAccessToken( userValidated );
		
		const	response = context.switchToHttp().getResponse();
		this.authService.setAccessTokenCookie( response, jwt ); // pose un cookie avec l'accessToken dans le header de la reponse (res)

		const	userPublic: UserPublic =
		{
			id:			userValidated.id,
			username:	userValidated.username,
			avatarUrl:	userValidated.avatarUrl,
			createdAt:	userValidated.createdAt,
			updatedAt:	userValidated.updatedAt
		}

		return ( userPublic ); // userPublic (protection données sensibles) renvoyé et retrouvé au niveau du controller
	}

}
 