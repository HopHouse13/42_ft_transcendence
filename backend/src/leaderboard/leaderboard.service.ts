import { Injectable } from "@nestjs/common";
import { UserLeaderboard } from "./interfaces/leaderboard.interface";
import { PrismaService } from "../prisma/prisma.service";
import { GameStatus } from "@prisma/client";

@Injectable()
export class LeaderboardService
{
	constructor( private readonly prisma: PrismaService ) {};

	async findLeaderboard() : Promise< UserLeaderboard[] >
	{
		const	usersArrayRaw = await this.prisma.user.findMany(
			{
				where:
				{
					isDelete:			false
				},
				orderBy:
				{
					elo:				'desc'
				},
				take: 200,
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

		const	leaderboardArray: UserLeaderboard[] = usersArrayRaw.map( ( user, idx ): UserLeaderboard =>
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
		console.table( leaderboardArray );
		return( leaderboardArray );
	}
};

//   { id: "a1", >rank: 1, username: "Grandmaster_Othello", avatarUrl: "...", elo: 2450, >wins: 182, >losses: 24, >winRate: "88.3%" },
// a calculer: rank, wins, losses, winRate