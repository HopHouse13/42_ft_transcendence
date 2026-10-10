import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ForbiddenException, Req, UseInterceptors, UploadedFile, /*ValidationPipe, UsePipes*/ } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarUploadOptions } from './avatar-upload.config';
import { UserUpdate } from './interfaces/user.interface';

// @UsePipes( new ValidationPipe() ) // instancie ValidationPipe pour qu'il check les regles du DTO lors d'une requete (actuellement instancié dans le main)
@UseGuards( JwtGuard ) // applique le guard 'JwtGuard'
@Controller( 'user' ) // décorateur : toutes les routes de cette classe sont préfixées par /users
export class UserController
{
	constructor( private readonly usersService : UserService) {} // constructeur pour injecter l'instance unique usersService de type UserService
	
	///

	@Get() // associe la méthode HTTP GET sur /users à la méthode findAll()
	findAll() // findAll() du controller ne fait que relayer l'appel vers findAll() du service, qui lui contient la logique métier
	{
		return( this.usersService.findAll()); // renvoie tel quel ce que usersService.findAll() a retourné
	}

	///
	
	@Get( ':id' ) // associe GET /users/:id à findOne()
	findOne( @Param( 'id', ParseUUIDPipe ) id: string ) // récupère l'id ciblé depuis l'URL
	{
		return( this.usersService.findOne( id )); // relaie id au service, qui renvoie le user ou lève un 404 si introuvable
	}

	///

	@Get( ':id/profile' )
	profile( @Param( 'id', ParseUUIDPipe ) id: string )
	{
		return( this.usersService.findProfile( id ));
	}

	///

	@Patch( ':id/profile' ) // méthode HTTP PATCH avec un arg (id) a récupérer avec @param
	@UseInterceptors(FileInterceptor( 'avatar',  avatarUploadOptions )) // avatar est le nom de chaque partie du fichier envoyé par le protocole multipart (http)
	updateProfile( @Req() request, @Param( 'id', ParseUUIDPipe ) id: string, @Body() dto: UpdateUserDto ) // prends 2 params: id -> param recupéré sur url et DTO qui est instancié avec toutes la data du body de la requete
	{
		if ( request.user.id !== id )
			throw new ForbiddenException( 'you can only modify your own account' );

		const	file = request.file; // objet avec les metadonnées du fichier qui vient d'etre upload par FileInterceptor
		const	newAvatarUrl = file ? `/uploads/avatars/${ request.file.filename }` : undefined;

		const	data: UserUpdate =
		{
			username:	dto.username,
			avatarUrl:	newAvatarUrl
		}
		return( this.usersService.updateProfile( id, data )); // retourne userPublic
	}

	///

	@Delete( ':id' ) // associe la méthode HTTP DELETE sur /users/:id à la méthode remove()
	remove( @Req() request, @Param( 'id', ParseUUIDPipe ) id: string ) // récupère l'id du user dans l'url
	{
		if ( request.user.id !== id )
			throw new ForbiddenException( 'you can only delete your own account' );

		return( this.usersService.remove( id ));
	}
}

// ParseUUIDPipe -> pipe specialisé (pas besoin de DTO). Son code est ecrit en dur. Pas besoin de l'instancier
// DTO -> donne un modele d'objet js que ValidationPipe utilise pour instancier et verifier les donnée de l'objet a partir de la donnée brute du body d'une requete
