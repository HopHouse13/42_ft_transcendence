import { Injectable } from '@nestjs/common'; // décorateur qui rend cette classe injectable
import { PrismaService } from '../database/prisma.service'; // la class PrismaService qui encapsule PrismaClient

@Injectable() // cette classe peut être injectée
export class UsersService
{
	// Le constructeur declare/initialiser Prisma avec l'injection de PrismaService (instance de PrismaService)
	// il faut voir ca un peu comme la ligne d'initialisation des attributs du class en c++
	// prisma devient un attribut privé avec la valeur (du pointeur) de l'objet PrismaService (instancié en debut de programme)
	constructor( private readonly prisma: PrismaService ) {}

	async findAll()
	{
		const	users = await this.prisma.user.findMany(
		{
		select: // ne retourne que les champs listés à true
			{
			id: true,
			username: true,
			avatarUrl: true,
			createdAt: true,
			},
		});
		return ( users ); // users est un tableau d'objets, un objet = un user
	}
}
