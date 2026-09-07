import { IsString, MinLength, MaxLength } from "class-validator";

export class LoginDto
{
	@IsString()
	@MinLength( 1 )
	@MaxLength( 50 )
	username!: string;

	@IsString()
	@MinLength( 1 )
	@MaxLength( 255 )
	password!: string;
}

// ces propriétés ont déjà été vérifiés dans register()
// on veut juste etre sur que le back ne traitre pas un usename/password avec enormément de char ou vide