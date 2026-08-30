import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common"; // import des décorateurs utiles à UsersController
import { UsersService } from "./users.service"; // import de la definition de la classe UserService de users.service
import { CreateUserDto } from "./dto/create-user.dto"; // import de la classe CreateUserDto
import { UpdateUserDto } from "./dto/update-user.dto"; // import de la classe UpdateUserDto

@Controller( 'users' ) // décorateur : toutes les routes de cette classe sont préfixées par /users
export class UsersController
{
	constructor( private readonly usersService : UsersService) {} // constructeur pour injecter l'instance unique usersService de type UsersService
	
	/////

	@Get() // associe la méthode HTTP GET sur /users à la méthode findAll()
	findAll() // findAll() du controller ne fait que relayer l'appel vers findAll() du service, qui lui contient la logique métier
	{
		return ( this.usersService.findAll() ); // renvoie tel quel ce que usersService.findAll() a retourné
	}

	/////

	@Post() // associe la méthode HTTP POST à /users pour la méthode create()
	create( @Body() dto : CreateUserDto ) // @Body() extrait le corps JSON de la requête et instancie dto avec cette data
	{
		return ( this.usersService.create( dto ) ); // appel de create de usersService avec comme param dto ( instance de type CreateUserDto oú est stocké les data du body de la requete )
	}

	/////

	@Patch( ':id' ) // méthode HTTP PATCH avec un arg (id) a récupérer avec @param
	update( @Param( 'id' ) id: string, @Body() dto: UpdateUserDto ) // prends 2 params: id -> param recupéré sur url et DTO qui est instancié avec toutes la data du body de la requete
	{
		return ( this.usersService.update(id, dto) ); // retourne le resultat de update de usersService -> l'objet complet user qui a été modifié
	}

	/////

	@Delete( ':id' ) // associe la méthode HTTP DELETE sur /users/:id à la méthode remove()
	remove( @Param( 'id' ) id: string ) // récupère l'id du user dans l'url
	{
		return ( this.usersService.remove( id ) );
	}
}
