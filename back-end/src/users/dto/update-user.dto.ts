import { IsString, IsEmail, IsOptional } from "class-validator";

// IsOptional est un decorateur qui dit a nest: si la propriété est absente, c'est normal,ignore le reste des controles et passe au suivant.
export class UpdateUserDto
{
	@IsString()
	@IsOptional()
	username?: string; // '?' dit a typescript que cette propriété peut ne pas etre initialisée

	@IsEmail()
	@IsOptional()
	email?: string;

}