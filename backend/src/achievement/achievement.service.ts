import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Game, GameStatus, Move, StatusFriendship, User, Prisma, Achievement } from '@prisma/client';
import { achievementList } from './constants/achievementListe.constant';
import { GameWithMoves } from './types/gameWithMoves.type';

@Injectable()
export class AchievementService
{
	constructor( private readonly prisma: PrismaService ) {};

	async findAchievement( rawId: string )
	{
		const	user = await this.prisma.user.findUnique( // recuperation du user
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

		const achievement = await this.prisma.achievement.findMany( // recuperation des achievements
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
	
	// PLAN
	//
	// 1. Récupérer la game
	//	- findUniqueOrThrow : la game doit exister et être FINISHED
	//	- include des moves triés par moveNumber croissant (asc) : les calculs lisent le dernier coup
	//	  et comparent un coup à son précédent
	//	- une game sans aucun coup n'est pas évaluée -> return []
	//
	// 2. Pour chacun des deux joueurs (black puis white)
	//	- unlockedBefore : findMany des achievements déjà débloqués ; .map() ne garde que la string achievementId
	//	- lockedBefore : achievementList.filter() garde les ids absents de unlockedBefore
	//	  (.includes() renvoie true si un élément du tableau === l'argument)
	//	- pour chaque id de lockedBefore, isUnlocked_() appelle la méthode de calcul correspondante (switch)
	//	- si true -> push { userId, achievementId } dans newAchievements
	//
	// 3. Écriture en base
	//	- newAchievements regroupe les nouveaux achievements des deux joueurs : un seul appel
	//	  createManyAndReturn()
	//	- skipDuplicates : pas d'erreur db si l'objet existe déjà
	//
	// 4. Retourner les achievements créés (tableau vide si aucun)
	
	async validateAchievement( gameId: string )
	{
		const game: GameWithMoves = await this.prisma.game.findUniqueOrThrow(
			{
				where:
				{
					id: 	gameId,
					status:	GameStatus.FINISHED
				},
				include:
				{
					moves:
					{
						orderBy: 
						{
							moveNumber: 'asc'
						}
					}
				}
			}
		)

		if ( !game.moves.length )
			return ( [] );

		const	newAchievements: Prisma.AchievementCreateManyInput[] = [];

		for ( const userId of [ game.blackPlayerId, game.whitePlayerId ])
		{
			const	unlockedBefore: Readonly<string[]> = ( await this.prisma.achievement.findMany(
				{
					where:
					{
						userId
					},
					select:
					{
						achievementId:	true
					}
				}
			)).map(( achiev ) => achiev.achievementId )
			
			const	lockedBefore: Readonly<string[]> = achievementList.filter(( achievId: string ) => !unlockedBefore.includes( achievId ));
		
			for ( const achievId of lockedBefore )
				if ( await this.isUnlocked_( achievId, game, userId ))
					newAchievements.push({ userId, achievementId: achievId });
		}

		const	newAchievementsWritten: Achievement[] = await this.prisma.achievement.createManyAndReturn(
			{
				data:
					newAchievements,
				skipDuplicates:	true
			}
		);

		return ( newAchievementsWritten );
	}

	///

	private async isUnlocked_( achievId: string, game: GameWithMoves, userId: string ): Promise<boolean>
	{

		switch( achievId )
		{
			case 'win_first':			return ( this.win_first( game, userId ));
			case 'win_both_sides':		return ( this.win_both_sides( userId ));
			case 'brd_corner':			return ( this.brd_corner( game, userId ));
			case 'brd_4corners':		return ( this.brd_4corners( game, userId ));
			case 'brd_edges':			return ( this.brd_edges( game, userId ));
			case 'mov_flip10':			return ( this.mov_flip10( game, userId ));
			case 'mov_pass1':			return ( this.mov_pass1( game, userId ));
			case 'mov_pass3':			return ( this.mov_pass3( game, userId ));
			case 'win_close':			return ( this.win_close( game, userId ));
			case 'win_blowout':			return ( this.win_blowout( game, userId ));
			case 'win_wipeout':			return ( this.win_wipeout( game, userId ));
			case 'win_comeback':		return ( this.win_comeback( game, userId ));
			case 'win_3corners_down':	return ( this.win_3corners_down( game, userId ));
			case 'stk_win5':			return ( this.stk_win5( userId ));
			case 'cum_win50':			return ( this.cum_win50( userId ));
			case 'soc_rival10':			return ( this.soc_rival10( game, userId ));
			case 'elo_1200':			return ( this.elo_1200( userId ));
			case 'elo_1500':			return ( this.elo_1500( userId ));
			case 'elo_1800':			return ( this.elo_1800( userId ));
			case 'elo_giant_slayer':	return ( this.elo_giant_slayer( game, userId ));

			default:					return( false );
		}
	}

/// CALCULATION METHODS ///////////////////////////////////////////////////////////////////////////////////////////////

	// Gagne ta toute première partie en ligne.
	private win_first( game: GameWithMoves, userId: string )
	{
		return ( game.winnerId === userId );
	}

	///

	// Gagne au moins une partie avec les Noirs et une avec les Blancs.
	private async win_both_sides( userId: string )
	{
		const	blackGame = await this.prisma.game.count(
			{
				where:
				{
					blackPlayerId:	userId,
					winnerId:		userId,
					status:			GameStatus.FINISHED

				},

			}
		)

		const	whiteGame = await this.prisma.game.count(
			{
				where:
				{
					whitePlayerId:	userId,
					winnerId:		userId,
					status:			GameStatus.FINISHED

				},
			}
		)

		return (( blackGame > 0 && whiteGame > 0 ));
	}

	///

	// Possède au moins un coin à la fin de la partie.
	private brd_corner( game: GameWithMoves, userId: string )
	{
		const	finalBoard: string = game.moves[ game.moves.length - 1 ].boardAfter;

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W';

		return ([ 0, 7, 56, 63 ].some(( idx ) => finalBoard[ idx ] === myColor ));
	};

	///

	// Possède les 4 coins à la fin de la partie.
	private brd_4corners( game: GameWithMoves, userId: string )
	{
		const	finalBoard: string = game.moves[ game.moves.length - 1 ].boardAfter;

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W';

		const	cornerCount: number = [ 0, 7, 56, 63 ].filter(( idx ) =>  finalBoard[ idx ] === myColor ).length;

		return ( cornerCount === 4 );
	}

	///

	// Possède toutes les cases du bord à la fin de la partie.
	private brd_edges( game: GameWithMoves, userId: string )
	{
		const	finalBoard: string = game.moves[ game.moves.length - 1 ].boardAfter;

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W';

		const	edgeCount: number = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55, 56, 57, 58, 59, 60, 61, 62, 63 ].filter(( idx ) =>  finalBoard[ idx ] === myColor ).length;

		return ( edgeCount === 28 );
	}

	///

	// Retourne 10 pions ou plus en un seul coup.
	private mov_flip10( game: GameWithMoves, userId: string )
	{
		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE';

		for ( let idx: number = game.moves.length - 1; idx > 0; idx-- )
		{
			const	move: Move = game.moves[ idx ];
			const	prev: Move = game.moves[ idx - 1 ];

			if ( move.Color !== myColor )
				continue;

			const	pointsNb: number = ( myColor === 'BLACK' ) ? move.blackScore - prev.blackScore - 1 : move.whiteScore - prev.whiteScore - 1;

			if ( pointsNb >= 10 )
				return ( true );
		}

		return ( false );
	}

	///

	// Force l'adversaire à passer son tour au moins une fois.
	private mov_pass1( game: GameWithMoves, userId: string )
	{
		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE';
		let		prevIsMine: boolean = false;

		for ( const move of game.moves )
		{
			if ( move.Color === myColor )
			{
				if ( prevIsMine )
					return ( true );
				prevIsMine = true;
			}
			else
				prevIsMine = false;
		}

		return ( false );
	}

	///

	// Force l'adversaire à passer son tour au moins 3 fois dans la partie.
	private mov_pass3( game: GameWithMoves, userId: string )
	{
		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE';
		let		prevIsMine: boolean = false;
		let		passCount: number = 0;

		for ( const move of game.moves )
		{
			if ( move.Color === myColor )
			{
				if ( prevIsMine )
				{
					passCount++;
					if ( passCount >= 3 )
						return ( true );
				}
				prevIsMine = true;
			}
			else
				prevIsMine = false;
		}

		return ( false );
	}

	///

	// Gagne avec 1 ou 2 pions d'écart.
	private win_close( game: GameWithMoves, userId: string )
	{
		if ( game.winnerId !== userId )
			return ( false );

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE';
		const	gap: number = ( myColor === 'BLACK' ) ? ( game.blackScore! - game.whiteScore! ) : ( game.whiteScore! - game.blackScore! );

		return ( gap >= 1 && gap <= 2 );
	}

	///

	// Gagne avec 50 pions ou plus sur le plateau.
	private win_blowout( game: GameWithMoves, userId: string )
	{
		if ( game.winnerId !== userId )
			return ( false );

		const	myScore: number = ( game.blackPlayerId === userId ) ? game.blackScore! : game.whiteScore!;

		return ( myScore >= 50 );
	}

	///

	// Gagne sans laisser aucun pion à l'adversaire.
	private win_wipeout( game: GameWithMoves, userId: string )
	{
		if ( game.winnerId !== userId )
			return ( false );

		const	lastBoard: string = game.moves[ game.moves.length - 1 ].boardAfter;
		const	opponentColor: string = game.blackPlayerId === userId ? 'W' : 'B';

		return ( [ ...lastBoard ].every(( letter ) => letter !== opponentColor ));
	}

	///

	// Gagne après avoir été mené de 15 pions ou plus.
	private win_comeback( game: GameWithMoves, userId: string )
	{
		if( game.winnerId !== userId )
			return ( false );

		const	moves: Move[] = game.moves;
		const	isBlack: boolean = ( game.blackPlayerId === userId );

		for( const move of moves )
		{
			const	myScore: number  = isBlack ? move.blackScore : move.whiteScore;
			const	oppScore: number = isBlack ? move.whiteScore : move.blackScore;

			if ( oppScore - myScore >= 15 )
				return ( true );
		}

		return ( false );
	}

	///

	// Gagne alors que l'adversaire possède 3 coins ou plus.
	private win_3corners_down(  game: GameWithMoves, userId: string )
	{
		if( game.winnerId !== userId )
			return ( false );

		const	opponentColor: string = ( game.blackPlayerId === userId ) ? 'W' : 'B';
		const	finalBoard: string = game.moves[ game.moves.length - 1 ].boardAfter;

		const	opponentCornerCount: number = [ 0, 7, 56, 63 ].filter(( idx ) =>  finalBoard[ idx ] === opponentColor ).length;

		return ( opponentCornerCount >= 3 );
	}

	///

	// Enchaîne 5 victoires d'affilée.
	private async stk_win5( userId: string )
	{
		const	lastGames: Game[] = await this.prisma.game.findMany(
			{
				where:
				{
					status:		GameStatus.FINISHED,
					OR:
						[{ blackPlayerId: userId },
						{ whitePlayerId: userId }]
				},
				orderBy:
				{
					updatedAt:	'desc'
				},
				take: 5,
			}
		)

		return ( lastGames.length >= 5 && lastGames.every( ( game ) => game.winnerId === userId ));
	}

	///

	// Atteins 50 victoires au total.
	private async cum_win50( userId: string )
	{
		const	wonGames: number = await this.prisma.game.count(
			{
				where:
				{
					status:		GameStatus.FINISHED,
					winnerId:	userId
				}
			}
		)

		return ( wonGames >= 50 );
	}

	///

	// Joue 10 parties contre le même ami.
	private async soc_rival10( game: GameWithMoves, userId: string )
	{
		const	opponent = game.blackPlayerId === userId ? game.whitePlayerId : game.blackPlayerId;
		
		const	friend = await this.prisma.friendship.findFirst(
			{
				where:
				{
					status:	StatusFriendship.ACCEPTED,
					OR:
						[{ senderId: userId, receiverId: opponent },
						{ senderId: opponent, receiverId: userId }],
				}
			}
		)

		if ( !friend )
			return ( false );

		const	gamesVsOpponent = await this.prisma.game.count(
			{
				where:
				{
					status:		GameStatus.FINISHED,
					OR:
						[{ blackPlayerId: userId, whitePlayerId: opponent },
						{ blackPlayerId: opponent, whitePlayerId: userId }]
				},
			}
		)
		return ( gamesVsOpponent >= 10 );
	}

	///

	// Atteins 1200 d'elo.
	private async elo_1200( userId: string )
	{
		const	user: User = await this.prisma.user.findUniqueOrThrow(
			{
				where:
				{
					id:	userId
				}
			}
		)

		return ( user.elo >= 1200 );
	}

	///

	// Atteins 1500 d'elo.
	private async elo_1500( userId: string )
	{
		const	user: User = await this.prisma.user.findUniqueOrThrow(
			{
				where:
				{
					id:	userId
				}
			}
		)

		return ( user.elo >= 1500 );
	}

	///

	// Atteins 1800 d'elo.
	private async elo_1800( userId: string )
	{
		const	user: User = await this.prisma.user.findUniqueOrThrow(
			{
				where:
				{
					id:	userId
				}
			}
		)

		return ( user.elo >= 1800 );
	}

	///

	// Bats un adversaire classé 150 d'elo ou plus au-dessus de toi.
	private async elo_giant_slayer( game: GameWithMoves, userId: string )
	{
		if( game.winnerId !== userId )
			return ( false );

		const	opponentId: string = ( game.blackPlayerId === userId ) ? game.whitePlayerId : game.blackPlayerId;

		const	user : User = await this.prisma.user.findUniqueOrThrow(
			{
				where:
				{
					id:	userId
				}
			}
		)

		const	opponent : User = await this.prisma.user.findUniqueOrThrow(
			{
				where:
				{
					id: opponentId
				}
			}
		)

		return ( opponent.elo - user.elo >= 150 );
	}
}
