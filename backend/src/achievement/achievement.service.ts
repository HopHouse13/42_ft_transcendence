import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Game, GameStatus } from '@prisma/client';
import { achievementList } from './constants/achievementListe.constant';
import { GameWithMoves } from './types/gameWithMoves.type';
import { boolean } from 'joi';

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
	
	async validateAchievement( gameId: string )
	{
		const game: GameWithMoves = await this.prisma.game.findUniqueOrThrow( // recuperation de la game avec ses moves
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
								moveNumber: 'asc' // besoin de les extraites par ordre ascendant (<)
							}
						}
				}
			}
		)

		for ( const userId of [ game.blackPlayerId, game.whitePlayerId ]) // calcul pour les deux users
		{
			const	unlockedBefore: Readonly<string[]> = ( await this.prisma.achievement.findMany( // genere une array string d'id de achiev. unlocked du user
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
			)).map(( achiev ) => achiev.achievementId ) // map retourne la string  achievementId pour chaque element du tableau du retour de findMany
			
			// Pour chaque elem, .filter() execute la ft en arg. si truc -> ajoute cet element dans le nouveau tableau; .include() sur une array renvoie true si un elem du tableau est === a l'arg donné
			const	lockedBefore: Readonly<string[]> = achievementList.filter(( achievId: string ) => !unlockedBefore.includes( achievId ));
		
			const	unlockedAfter: string[] = []; // tableau des achievments debloqués pour cette partie

			for ( const achievId of lockedBefore ) // boucle sur tous les achievement bloqués de la liste
				if( await this.isUnlocked_( achievId, game, userId )) // si true -> rajoue d'un nouveau element avec l'id du achievement debloqué
					unlockedAfter.push( achievId );
		}
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
			//case 'mov_flip10':			return ( this.mov_flip10( game, userId ));
			//case 'mov_pass1':			return ( this.mov_pass1( game, userId ));
			//case 'mov_pass3':			return ( this.mov_pass3( game, userId ));
			//case 'win_close':			return ( this.win_close( game, userId ));
			//case 'win_blowout':			return ( this.win_blowout( game, userId ));
			//case 'win_wipeout':			return ( this.win_wipeout( game, userId ));
			//case 'win_comeback':		return ( this.win_comeback( game, userId ));
			//case 'win_3corners_down':	return ( this.win_3corners_down( game, userId ));
			//case 'stk_win5':			return ( this.stk_win5( game, userId ));
			//case 'cum_win50':			return ( this.cum_win50( game, userId ));
			//case 'soc_rival10':			return ( this.soc_rival10( game, userId ));
			//case 'elo_1200':			return ( this.elo_1200( game, userId ));
			//case 'elo_1500':			return ( this.elo_1500( game, userId ));
			//case 'elo_1800':			return ( this.elo_1800( game, userId ));
			//case 'elo_giant_slayer':	return ( this.elo_giant_slayer( game, userId ));

			default:					return( false );
		}
	}

/// CALCULATION METHODS ///////////////////////////////////////////////////////////////////////////////////////////////

	private win_first( game: GameWithMoves, userId: string )
	{
		return ( game.winnerId === userId );
	}

	///

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

	private brd_corner( game: GameWithMoves, userId: string ) // 0,7,56,63  // B W -
	{
		const	board: string | undefined = game.moves.at( -1 )?.boardAfter;
		
		if ( !board )
			return ( false );

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W';

		return ([ 0, 7, 56, 63 ].some(( idx ) => board[ idx ] === myColor )); // .some() renvoie true si le callback de la fonction est au moins une fois true
	};

	///

	private brd_4corners( game: GameWithMoves, userId: string )
	{
		const	board: string | undefined = game.moves.at( -1 )?.boardAfter;
		
		if ( !board )
			return ( false );

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W';

		const	cornerCount: number = [ 0, 7, 56, 63 ].filter(( idx ) =>  board[ idx ] === myColor ).length; // filter retourne un tableau avec les idx avec la couleur du player, lenght donne le nombre d'element de ce tableau

		return ( cornerCount === 4 );
	}

	///

	private brd_edges( game: GameWithMoves, userId: string )
	{
		const	board: string | undefined = game.moves.at( -1 )?.boardAfter;

		if ( !board )
			return ( false );

		const	myColor: string = ( game.blackPlayerId === userId ) ? 'B' : 'W'; // marqueurs de couleurs sur boardAfer en db

		const	edgeCount: number = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55, 56, 57, 58, 59, 60, 61, 62, 63 ].filter(( idx ) =>  board[ idx ] === myColor ).length;

		return ( edgeCount === 28 );
	}

	///

	//private mov_flip10( game: GameWithMoves, userId: string )
	//{

	//}

	///

	//private mov_pass1( game: GameWithMoves, userId: string )
	//{
	//	const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE'; // marqueurs de couleur de move en db
		
	//	for ( const move of game.moves )
	//	{
	//		if ( move.Color !== myColor && move.position === null )
	//			return ( true );
	//	}

	//	return ( false );
	//}

	private mov_pass1( game: GameWithMoves, userId: string )
	{
		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE'; // marqueurs de couleur de move en db
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

	//private mov_pass3( game: GameWithMoves, userId: string )
	//{
	//	const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE'; // marqueurs de couleur de move en db
	//	let		passCount: number = 0;

	//	for ( const move of game.moves )
	//	{
	//		if ( move.Color !== myColor && move.position === null )
	//		{
	//			passCount++;

	//			if ( passCount >= 3 )
	//				return ( true );
	//		}
	//	}
	//	return ( false );
	//}

	private mov_pass3( game: GameWithMoves, userId: string )
	{
		const	myColor: string = ( game.blackPlayerId === userId ) ? 'BLACK' : 'WHITE'; // marqueurs de couleur de move en db
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
}

/*
Plan:

- verif. si game existe et qu'elle soit FINISHED
- charge en readonly: la game et l'historique des cou

Pour chaque user:
- recuperer (findMany) tous les achiev unlocked[] dans une tableau
- genrerer le tableau inverser avec tous les lock (.filter)
- parcourir chaque element dans un switch (alternative -> record<>) pour appeler la methode correspondant a la achievementId
	-> si l achiavement est unlocked la methode psuh dans une 3eme array l'achievementId.
- apres le traitement de l'ensemble des achievement -> un appel en db avec createMany() pour genrer l'ensemble des achievments unlock

*/

/*
id					Titre						Description
win_first			Premier sang				Gagne ta toute première partie d’Othello en ligne.
win_both_sides		Ambidextre					Gagne une partie avec les Noirs et une partie avec les Blancs.
brd_corner			Investisseur immobilier		Prends ton premier coin du plateau.
brd_4corners		Monopole des coins			Contrôle les 4 coins à la fin de la partie.
brd_edges			Résidence sécurisée			Verrouille chaque case du bord avec ta couleur.
* mov_flip10			Effet domino				Retourne 10 pions ou plus en un seul coup.
-> mov_pass1			Accès refusé				Force ton adversaire à passer son tour.
-> mov_pass3			Tu es viré !				Force ton adversaire à passer son tour au moins 3 fois dans une même partie.

win_close			Au poil						Gagne une partie avec 2 pions d’écart ou moins.
win_blowout			Aucune chance				Gagne largement avec plus de 50 pions sur le plateau.
win_wipeout			Table rase					Efface tous les pions de ton adversaire du plateau avant la fin.
win_comeback		Retour d’entre les morts	Remonte et gagne après avoir été mené de 15 pions ou plus.
win_3corners_down	Contre toute attente		Gagne alors que ton adversaire a contrôlé 3 coins pendant la partie.
stk_win5			En feu						Enchaîne 5 victoires classées d’affilée.
cum_win50			Heures sup					Atteins 50 victoires au total sur la plateforme.
soc_rival10			Rivalité lancée				Joue 10 parties contre le même joueur de ta liste d’amis.
elo_1200			Promotion accordée			Franchis le seuil des 1 200 points Elo.
elo_1500			Associé senior				Atteins un classement Elo de 1 500 ou plus.
elo_1800			Directeur de la stratégie	Atteins un pic de 1 800 Elo ou plus.
elo_giant_slayer	David contre Goliath		Écrase un joueur classé 150 points Elo ou plus au-dessus de toi.
*/