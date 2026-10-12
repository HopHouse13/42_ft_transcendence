import { ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtGuard } from "./jwt.guard";

@Injectable()
export class SilentJwtGuard extends JwtGuard
{
	async handleRequest( err: any, user: any, info: any, context: ExecutionContext )
	{
		try
		{
			return ( await super.handleRequest( err, user, info, context ));
		}
		catch ( error )
		{
			if ( error instanceof UnauthorizedException || error instanceof NotFoundException )
				return ( null );
			throw ( error );
		}
	}
}
// si autres erreurs (db, code metier) que UnauthorizedException (session expirée), l'error est de nouveau lancée
// cas particulier: apres la validation du accesToken, validate() renvoie le user trouvé dans la db a partir des info du payload du accestoken
// Si ce user est "isDelete", findOne() souleve une exeption "NotFoundException", dans ce cas c'est une session expirée -> 204 (laisser gerer la methode me du controller)