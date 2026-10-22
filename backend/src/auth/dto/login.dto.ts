import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';

export class LoginDto
{
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength( 1 )
	@MaxLength( 255 )
	password!: string;
}