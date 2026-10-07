import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; 
import { FriendUser } from "./interfaces/friendUser.interface";
import { StatusFriendship } from "@prisma/client";
import { sensitiveHeaders } from "http2";

@Injectable()
export class FriendService
{
	constructor( private readonly prisma: PrismaService ) {};

	async sendRequest( sender: string, receiver: string ): Promise<FriendUser | undefined>
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
			select:
			{
				id:			true,
				username:	true,
				avatarUrl:	true,
				elo:		true
			}
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
					friendshipId:	{senderId: receiverFound.id, receiverId: sender}
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
				status:		StatusFriendship.WAITING
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
};

