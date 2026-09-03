import { IsString, IsEmail, MaxLength, MinLength } from "class-validator"; // import des decorateurs de validation


export class CreateUserDto // class DTO pour décrire + valider les données attendues du client pour POST /users
{
	@IsString()
	@MinLength( 3 )
	@MaxLength( 50 )
	username! : string;

	@IsEmail()
	@MaxLength( 255 )
	email! : string;
}

// `!` après une propriété de classe indique au compilateur que cette variable sera initialisée avant d'être utilisée