import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementService
{
	constructor( private readonly prisma: PrismaService ) {};

	async findAchievement( rawId: string )
	{
		const	user = await this.prisma.user.findUnique(
			{
				where:
				{
					id:			rawId,
					isDelete:	false
				},
				select:
				{
					id:			true
				}
			}
		);

		if ( !user )
			throw ( new NotFoundException( `User ${ rawId } does not exist` ));

		const achievement = await this.prisma.achievement.findMany(
			{
				where:
				{
					userId:			user.id
				},
				select:
				{
					achievementId:	true,
					unlockedAt:		true
				},
				orderBy:
				{
					unlockedAt:		'asc'
				}
			}
		);

		return( achievement );
	}
	
	///
	
	validateAchievement( gameId: string )
	{

	}
};

/*
Plan:

- verif. si game existe et qu'elle soit FINISHED
- verif. si les deux users existent
- make {un objet} le resumé de la game: (faire le detail)

Pour chaque user:
- recuperer (findMany) tous les achiev unlocked[] dans une tableau
- genrerer le tableau inverser tu 1er pour avoir tous les achievements lock
-parcourir un chaque element dans un switch (alternative -> record<>) pour appeler la methode correspondant a la achievementId
	-> si l achiavement est unlocked la methode psuh dans une 3eme array l'achievementId.
-apres le traitement de l'ensemble des achievement -> un appel en db avec createMany() pour genrer l'ensemble des achievments unlock

*/