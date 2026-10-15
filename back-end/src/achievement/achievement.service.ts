import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Game, Achievement } from '@prisma/client'

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
	
	async validateAchievement( gameId: string )
	{
		const game: Readonly<Game> = await this.prisma.game.findUniqueOrThrow(
			{
				where:
				{
					id: 	gameId
				},
				include:
				{
					moves:	true
				}
			}
		)

		const	arrayUnlocked: Readonly<Achievement[]> = await this.prisma.achievement.findMany(
			{
				where:
				{
					userId: game
				}
			}
		)
	}
};

/*
Plan:

- verif. si game existe et qu'elle soit FINISHED
- charge en readonly: la game et l'historique des cou

Pour chaque user:
- recuperer (findMany) tous les achiev unlocked[] dans une tableau
- genrerer le tableau inverser avec tous les lock (.filter)
-parcourir chaque element dans un switch (alternative -> record<>) pour appeler la methode correspondant a la achievementId
	-> si l achiavement est unlocked la methode psuh dans une 3eme array l'achievementId.
-apres le traitement de l'ensemble des achievement -> un appel en db avec createMany() pour genrer l'ensemble des achievments unlock

*/