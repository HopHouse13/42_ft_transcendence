import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService
{
	// Un utilisateur reste en ligne tant qu'au moins un onglet ou appareil garde sa socket active.
	private readonly socketsByUser = new Map<string, Set<string>>();

	addSocket( userId: string, socketId: string ): boolean
	{
		const	sockets = this.socketsByUser.get( userId ) ?? new Set<string>();
		const	isFirstSocket = sockets.size === 0;

		sockets.add( socketId );
		this.socketsByUser.set( userId, sockets );

		return ( isFirstSocket );
	}

	removeSocket( userId: string, socketId: string ): boolean
	{
		const	sockets = this.socketsByUser.get( userId );

		if ( !sockets )
			return ( false );

		sockets.delete( socketId );

		if ( sockets.size !== 0 )
			return ( false );

		this.socketsByUser.delete( userId );
		return ( true );
	}

	isOnline( userId: string ): boolean
	{
		return ( (this.socketsByUser.get( userId )?.size ?? 0) > 0 );
	}
}
