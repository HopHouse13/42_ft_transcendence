import { Injectable } from "@nestjs/common";
import { Leaderboard, UserLeaderboard } from "./interfaces/leaderboard.interface";
import { PrismaService } from "../prisma/prisma.service";
import { GameStatus } from "@prisma/client";

@Injectable()
export class LeaderboardService
{
	constructor( private readonly prisma: PrismaService ) {};

	async findLeaderboard( currentUserId?: string ): Promise< Leaderboard >
	{
		const	usersArrayRaw = await this.prisma.user.findMany(
			{
				where:
				{
					isDelete:			false
				},
				orderBy:
				[
					{elo:				'desc'},
					{createdAt:			'asc'}
				],
				select:
				{
					id:					true,
					username:			true,
					avatarUrl:			true,
					elo:				true,
					gamesAsBlack :
					{
						where:
						{
							status:		GameStatus.FINISHED
						},
						select:
						{
							winnerId:	true
						}
					},
					gamesAsWhite :
					{
						where:
						{
							status:		GameStatus.FINISHED
						},
						select:
						{
							winnerId:	true
						}
					}
				}
			}
		)

		const	topUsers: UserLeaderboard[] = usersArrayRaw.map( ( user, idx ): UserLeaderboard =>
			{
				const	games 		= [ ... user.gamesAsBlack, ... user.gamesAsWhite ];
				const	gameCount	= games.length;
				const	wins		= games.filter(( game ) => { return( game.winnerId === user.id )}).length;
				const	draw		= games.filter(( game ) => { return( game.winnerId === null )}).length;
				const	losses		= gameCount - wins - draw;
				const	winRate		= gameCount === 0 ? 0 : Number(( wins / gameCount * 100 ).toFixed( 1 ));
				return (
					{
						id:			user.id,
						username:	user.username,
						avatarUrl:	user.avatarUrl,
						elo:		user.elo,
						rank:		idx + 1,
						wins,
						losses,
						winRate
					}
				)
			}
		)

		const	currentUser = topUsers.find(( user ) => { return ( user.id === currentUserId ); }); // find renvoie undefined si rien trouvé

		return({ topUsers, currentUser });
	}
};