import { IsStrongPassword, MaxLength, Matches, IsString, Length } from 'class-validator';

export class ResetPasswordDto
{
	@IsString()
	@Length( 64, 64 ) // indique que le token doit faire 64 charateres exatement
	token!: string;

	@MaxLength( 255 )
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
};