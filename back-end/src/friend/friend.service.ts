import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; 
import { FriendLists, FriendUser, FriendshipRaw } from "./interfaces/friend.interface";
import { StatusFriendship } from "@prisma/client";
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
			await this.prisma.friendship.create(
			{
				data:
				{
					senderId:	sender,
					receiverId:	receiverFound.id
				}
			});
		}
		else if ( friendshipExisting.status === StatusFriendship.WAITING && friendshipExisting.senderId === receiverFound.id ) // acceptation automatique car une demande de userB -> userA etait deja en attente
		{
			await this.prisma.friendship.update(
			{
				where:
				{
					friendshipId:	{ senderId: receiverFound.id, receiverId: sender }
				},
				data:
				{
					status:			StatusFriendship.ACCEPTED
				}
			});
		}
		else // cas ou deja amis ou demande deja faite
			return;

		//return ( receiverFound ); a voir si mael veut un retour ou pas si demande envoyé
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
		const 	send:		FriendUser[] = [];
		const 	received:	FriendUser[] = [];

		for ( let i = 0; i < friendsRaws.length; i++ ) //  for( const <objet> of <tableau> ) <- plus simple mais j'aime pas
		{
			const	isSender:	boolean = friendsRaws[i].sender.id === userId ? true : false;
			const	other:		FriendUser = isSender ? friendsRaws[i].receiver : friendsRaws[i].sender;

			if ( friendsRaws[i].status === StatusFriendship.ACCEPTED )
				friends.push( other );
			else if ( isSender )
				send.push( other );
			else
				received.push( other );

			//if ( sender && friendsRaws[i].status === StatusFriendship.ACCEPTED )
			//	friends.push( friendsRaws[i].receiver );
			//else if ( !sender && friendsRaws[i].status === StatusFriendship.ACCEPTED )
			//	friends.push( friendsRaws[i].sender );
			//else if ( sender && friendsRaws[i].status === StatusFriendship.WAITING )
			//	send.push( friendsRaws[i].receiver );
			//else if ( !sender && friendsRaws[i].status === StatusFriendship.WAITING )
			//	received.push( friendsRaws[i].sender );
		}

		const	friendLists: FriendLists =
		{
			friends,
			send,
			received
		}

		return( friendLists );
	}
};