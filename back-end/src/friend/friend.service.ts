import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FriendLists, FriendUser, FriendshipRaw } from "./interfaces/friend.interface";
import { Prisma, StatusFriendship } from "@prisma/client";
import { friendUserSelect } from "./friendUser.select"; 

@Injectable()
export class FriendService
{
	constructor( private readonly prisma: PrismaService ) {};

	async sendRequest( sender: string, receiver: string )/*: Promise<FriendUser | undefined>*/
	{
		// si userA -> userA
		if ( sender === receiver )
			return; //throw new ForbiddenException( 'You can\'t send a friend request to yourself' );    <- fini le proccessus silencieusement

		const	receiverFound: FriendUser | null = await this.prisma.user.findUnique(
		{
			where:
			{
				id:	receiver,
				isDelete: false
			},
			select:	friendUserSelect // objet au format FriendUser -> il defini select
		});

		// si userA -> ...
		if ( !receiverFound )
			return;
		
		const	friendshipExisting = await this.prisma.friendship.findFirst(
		{
			where:
			{
				OR:
				[
					{ senderId: sender, receiverId: receiver }, // si demande de userA deja faites a userB
					{ senderId: receiver, receiverId: sender } // si demande de userB deja faites a userA
				]
			},
			select:
			{
				senderId:	true,
				receiverId:	true,
				status:		true,
				createdAt:	true
			}
		});
		
		// si aucune friendship existe
		if ( !friendshipExisting )
		{
			try
			{
				await this.prisma.friendship.create(
				{
					data:
					{
						senderId:	sender,
						receiverId:	receiverFound.id
					}
				});
			}
			catch ( err )
			{
				if ( err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' ) // erreur d'unicité -> la demande a deja ete faite
					return;
				throw ( err ); // re throw les autres erreurs catch
			}
		}
		else if ( friendshipExisting.status === StatusFriendship.WAITING && friendshipExisting.senderId === receiverFound.id ) // acceptation automatique car une demande de userB -> userA etait deja en attente
		{
			await this.prisma.friendship.updateMany( // les methodes ...Many ne renvoient pas d'erreur si zero l'element trouvé, elles renvoient un objet avec zero element.
			{
				where:
				{
					senderId:		receiverFound.id,
					receiverId:		sender,
					status:			StatusFriendship.WAITING
				},
				data:
				{
					status:			StatusFriendship.ACCEPTED
				}
			});
		}
		else // cas ou deja amis ou demande deja faite
			return;

		//return ( receiverFound ); a voir si le front veut un retour ou pas si demande envoyé
	}

	///

	async accept( receiver: string, sender: string )
	{
		await this.prisma.friendship.updateMany( // updateMany renvoie un tableau des elements modifié -> renvoie un tableau vite si rien trouvé -> jamais de throw error
		{
			where:
			{
				senderId:	sender,
				receiverId:	receiver,
				status:		StatusFriendship.WAITING,

				sender:		{isDelete: false},
				receiver:	{isDelete: false},
			},
			data:
			{
				status:			StatusFriendship.ACCEPTED
			}
		});
	}

	///

	async delete( userId: string, otherId: string )
	{
		await this.prisma.friendship.deleteMany(
		{
			where:
			{
				OR:
				[
					{ senderId: userId, receiverId: otherId },
					{ senderId: otherId, receiverId: userId }
				]
			},
		});
	}

	///

	async friendLists( userId: string ): Promise<FriendLists>
	{
		const	friendsRaws: FriendshipRaw[] = await this.prisma.friendship.findMany(
		{
			where:
			{
				sender:		{ isDelete: false }, // se sont des relation: reference a la table de user
				receiver:	{ isDelete:	false }, // same

				OR:
				[
					{ senderId:		userId },
					{ receiverId:	userId }
				]
			},
			select: 
			{
				status:		true,
				sender: 	{ select:	friendUserSelect },
				receiver:	{ select:	friendUserSelect },
			}
		});

		const	friends:	FriendUser[] = [];
		const 	sent:		FriendUser[] = [];
		const 	received:	FriendUser[] = [];

		for ( let i = 0; i < friendsRaws.length; i++ ) //  for( const <objet> of <tableau> ) <- plus simple mais j'aime pas
		{
			const	isSender:	boolean = friendsRaws[i].sender.id === userId ? true : false;
			const	other:		FriendUser = isSender ? friendsRaws[i].receiver : friendsRaws[i].sender;

			if ( friendsRaws[i].status === StatusFriendship.ACCEPTED )
				friends.push( other );
			else if ( isSender )
				sent.push( other );
			else
				received.push( other );
		}

		const	friendLists: FriendLists =
		{
			friends,
			sent,
			received
		}

		return( friendLists );
	}

	///

	async search( userId: string, searchName?: string ): Promise<FriendUser[]>
	{
		if ( !searchName )
			return ( [] );

		const	suggestion: FriendUser[] = await this.prisma.user.findMany(
		{
			where:
			{
				isDelete:	false, // pas de compte supprimé
				username:	{ contains: searchName, mode: 'insensitive' }, // recherche partiel a partir de searchName, recherche insensible a la case
				id:			{ not: userId } // pour ne pas retourner lui meme
			},
			take:			5,
			select:			friendUserSelect
		});

		return( suggestion );
	}
};