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
			throw ( new NotFoundException( `User ${ rawId } does not exist` ) );

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
};