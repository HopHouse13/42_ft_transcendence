import { IsString, IsEmail, IsOptional, MaxLength, MinLength } from "class-validator";

// IsOptional est un decorateur qui dit a nest: si la propriété est absente, c'est normal,ignore le reste des controles et passe au suivant.
export class UpdateUserDto
{
	@IsOptional()
	@IsString()
	@MinLength( 3 )
	@MaxLength( 50 )
	username?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength( 255 )
	email?: string;
}

 // '?' dit a typescript que cette propriété peut ne pas etre initialisée