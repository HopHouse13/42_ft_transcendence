import { Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { FriendService } from '../friend/friend.service';
import { Payload } from '../auth/interfaces/payload.interface';
import { UserService } from '../user/user.service';
import { PresenceService } from './presence.service';

// Un namespace dédié isole l'authentification de présence des sockets de jeu et de chat.
@WebSocketGateway({ namespace: '/presence' })
export class PresenceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Namespace;

	private readonly logger = new Logger( PresenceGateway.name );

	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UserService,
		private readonly friendService: FriendService,
		private readonly presenceService: PresenceService
	) {}

	afterInit( server: Namespace ): void
	{
		// L'identité Socket.IO est vérifiée côté serveur : aucun userId fourni par le client n'est accepté.
		server.use( async ( client: Socket, next ) =>
		{
			const	cookieHeader = client.handshake.headers.cookie;
			const	accessCookie = cookieHeader?.split( ';' )
				.map( ( cookie ) => cookie.trim() )
				.find( ( cookie ) => cookie.startsWith( 'access_token=' ));
			const	token = accessCookie?.slice( 'access_token='.length );

			if ( !token )
				return ( next( new Error( 'Unauthorized' ) ));

			let	payload: Payload;

			try
			{
				payload = await this.jwtService.verifyAsync<Payload>( token );
			}
			catch
			{
				return ( next( new Error( 'Unauthorized' ) ));
			}

			if ( typeof payload.sub !== 'string' )
				return ( next( new Error( 'Unauthorized' ) ));

			try
			{
				await this.usersService.findOne( payload.sub );
			}
			catch ( error )
			{
				if ( error instanceof NotFoundException )
					return ( next( new Error( 'Unauthorized' ) ));

				this.logger.error( 'Unable to validate a presence connection', error );
				return ( next( new Error( 'Unable to authenticate connection' ) ));
			}

			client.data.userId = payload.sub;
			return ( next() );
		});
	}

	async handleConnection( client: Socket ): Promise<void>
	{
		const	userId = client.data.userId as string | undefined;

		if ( !userId )
		{
			client.disconnect( true );
			return;
		}

		const	isFirstSocket = this.presenceService.addSocket( userId, client.id );

		try
		{
			await client.join( this.userRoom( userId ));
			await this.sendSnapshot( client, userId );

			// Un disconnect peut arriver pendant le chargement du snapshot ; ne pas annoncer un état déjà périmé.
			if ( isFirstSocket && this.presenceService.isOnline( userId ))
				await this.notifyFriends( userId, true );
		}
		catch ( error )
		{
			this.presenceService.removeSocket( userId, client.id );
			client.disconnect( true );
			this.logger.error( `Unable to initialize presence for user ${userId}`, error );
		}
	}

	async handleDisconnect( client: Socket ): Promise<void>
	{
		const	userId = client.data.userId as string | undefined;

		if ( !userId || !this.presenceService.removeSocket( userId, client.id ))
			return;

		await this.notifyFriends( userId, false );
	}

	@SubscribeMessage( 'presence:sync' )
	async handleSync( @ConnectedSocket() client: Socket ): Promise<void>
	{
		const	userId = client.data.userId as string | undefined;

		if ( !userId )
			return;

		try
		{
			await this.sendSnapshot( client, userId );
		}
		catch ( error )
		{
			this.logger.error( `Unable to refresh presence for user ${userId}`, error );
		}
	}

	private async sendSnapshot( client: Socket, userId: string ): Promise<void>
	{
		const	{ friends } = await this.friendService.friendLists( userId );
		const	statuses: Record<string, boolean> = {};

		for ( const friend of friends )
			statuses[ friend.id ] = this.presenceService.isOnline( friend.id );

		client.emit( 'presence:snapshot', { statuses });
	}

	private async notifyFriends( userId: string, isOnline: boolean ): Promise<void>
	{
		try
		{
			const	{ friends } = await this.friendService.friendLists( userId );

			// Une reconnexion peut gagner la course pendant la requête de relations ; seul l'état courant est diffusé.
			if ( this.presenceService.isOnline( userId ) !== isOnline )
				return;

			for ( const friend of friends )
			{
				this.server.to( this.userRoom( friend.id )).emit( 'presence:changed',
					{ userId, isOnline });
			}
		}
		catch ( error )
		{
			this.logger.error( `Unable to notify friends about presence for user ${userId}`, error );
		}
	}

	private userRoom( userId: string ): string
	{
		return ( `presence:${userId}` );
	}
}
