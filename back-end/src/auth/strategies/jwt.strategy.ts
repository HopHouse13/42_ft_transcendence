import { Injectable } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt"; // passport-jwt est un package générique specialisé JWT de JS (independant a Nest)
import { PassportStrategy } from "@nestjs/passport"; // PassportStrategy est une fonction pour faire le pont entre les lib comme passport a l'environement nest. Elle retourne une nouvelle classe, générée à partir de la classe externe passée en arg, adaptée à l'environnement Nest.
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";
import { Payload } from "../interfaces/payload.interface";

// PassportStrategy(Strategy) -> mixin (fonction) qui adapte la classe Strategy (la classe de vérification spécifique à passport-jwt) à Nest et retourne une classe utilisable dans Nest
// JwtStrategy en hérite ensuite
@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy )
{
	constructor( private configService: ConfigService, private userService: UsersService )
	{
		// super() exécute le constructeur de la classe parente, avec la config suivante, pour qu'elle s'initialise correctement.
		super({
			jwtFromRequest:		ExtractJwt.fromAuthHeaderAsBearerToken(), // où -> dans le header de la requete à la propriété "Authorization" comme un "Bearer Token" (type de token)
			ignoreExpiration:	false, // est ce qu'on ignore la date d'expiration -> non
			secretOrKey:		configService.getOrThrow<string>( 'JWT_SECRET' ) // Avec quoi on re-génére la signature pour la comparer
		});
	}

	// méthode appelé automatiquement par passport si le token est valide. "payload" -> objet qui est le payload décodé par passport (id+username)
	async	validate( payload: Payload )
	{
		return( this.userService.findOne( payload.sub ) ); // appelle findOne() pour renvoyer le user à jour, plutôt que de faire confiance aux données figées du payload
	}
};
// validate est une methode obligatoire a implementer avec une class strategy, son retour devient automatiquement request.user. Cet objet est accessible dans le controller.