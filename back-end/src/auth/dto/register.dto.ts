import { IsStrongPassword, MaxLength, Matches, IsString, MinLength, IsEmail } from "class-validator";

// DTO pour valider le body de POST /auth/register
export class RegisterDto
{
	@MaxLength( 255 ) // Max 255 char pour le password
	@IsStrongPassword({
		minLength: 8,
		minUppercase: 0,
		minLowercase: 0,
		minNumbers: 1,
		minSymbols: 1
	})
	@Matches( /(?=.*[A-Za-z])/, { message: 'password must contain at least one letter' } ) // reGex(regular Expression): au moins 1 lettre
	@Matches(/^[a-zA-Z0-9.@#$*!?_+-]+$/, { message: 'password must contains an unauthorised character (allowed: letters, numbers, . @ # $ * ! ? _ + -)' } ) // Caractères autorisés : lettres, un chiffre, un caractère spécial situé
	password!: string;

	@IsString()
	@MinLength( 3 )
	@MaxLength( 50 )
	username!: string; // mêmes règles que CreateUserDto (users/dto/create-user.dto.ts)

	@IsEmail()
	@MaxLength( 255 )
	email! : string; // mêmes règles que CreateUserDto
};
// `!` après une propriété de classe indique au compilateur que cette variable sera initialisée avant d'être utilisée


// Régles pass:
// - entre 8 et 255 char
// - minimum une lettre un chiffre, un caractere special
// - caracteres speciaux autorisés: . @ # $ * ! ? - _ +

// regex -> ^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[.@#$*!?_+-])[a-zA-Z0-9.@#$*!?_+-]{8,255}