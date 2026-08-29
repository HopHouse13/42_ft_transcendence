import { Controller, Get } from "@nestjs/common"; // import des décorateurs Controller et Get
import { UsersService } from "./users.service"; // import de la definition de la classe UserService de users.service

@Controller( 'users' ) // décorateur : toutes les routes de cette classe sont préfixées par /users
export class UsersController
{
	constructor( private readonly usersService : UsersService) {} // constructeur pour injecter l'instance unique usersService de type UsersService
	
	@Get() // décorateur : associe la méthode HTTP GET sur /users à la ft findAll()
	findAll() // findAll() du controller ne fait que relayer l'appel vers findAll() du service, qui lui contient la logique métier
	{
		return( this.usersService.findAll() ); // renvoie tel quel ce que usersService.findAll() a retourné
	}
}
