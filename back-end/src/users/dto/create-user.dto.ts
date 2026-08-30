import { IsString, IsEmail, IsNotEmpty } from "class-validator"; // import des decorateurs de validation


export class CreateUserDto // class DTO pour décrire + valider les données attendues du client pour POST /users
{
	@IsString()
	@IsNotEmpty()
	username! : string;
	@IsEmail()
	email! : string;
}

// `!` après une propriété de classe indique au compilateur que cette variable sera initialisée
// avant d'être utilisée (remplie par Nest/class-transformer à partir du corps de la requête)