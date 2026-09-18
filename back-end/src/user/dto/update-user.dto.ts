import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsUrl } from 'class-validator';
import { UserUpdate } from '../interfaces/user.interface';

// IsOptional est un decorateur qui dit a nest: si la propriété est absente, c'est normal,ignore le reste des controles et passe au suivant.
// '?' dit a typescript que cette propriété peut ne pas etre initialisée
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

	@IsOptional()
	@IsUrl()
	@MaxLength( 255 )
	avatarUrl?: string;

}

// fonction de mapping entre les données du dto et l'objet data
export function extractUserUpdate( dto: UpdateUserDto ): UserUpdate
{
	const	data: UserUpdate =
	{
		username:	dto.username,
		email:		dto.email,
		avatarUrl:	dto.avatarUrl
	};

	return ( data );
}