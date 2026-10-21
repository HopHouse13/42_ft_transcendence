import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { queryKeys } from '../queries/queryKeys';
import { useAuthSession } from './useAuthSession';

export type PresenceMap = Record<string, boolean>;

interface PresenceSnapshot
{
	statuses: PresenceMap;
}

interface PresenceChange
{
	userId: string;
	isOnline: boolean;
}

export function usePresenceConnection(): void
{
	const	queryClient = useQueryClient();
	const	{ user, loading } = useAuthSession();

	useEffect( () =>
	{
		if ( loading || !user?.id )
			return;

		const	userId = user.id;
		const	queryKey = queryKeys.presence.onlineFriends( userId );
		const	socket = io( `${window.location.origin}/presence`,
		{
			autoConnect:		false,
			withCredentials:	true
		});

		let	syncInterval: number | undefined;
		let	disposed = false;
		let	retriedAuthentication = false;

		// Les statuts de présence sont éphémères : le cache est alimenté par le snapshot et les événements WS.
		queryClient.setQueryData<PresenceMap>( queryKey, {} );

		const	onConnect = () =>
		{
			retriedAuthentication = false;
			socket.emit( 'presence:sync' );
			window.clearInterval( syncInterval );
			syncInterval = window.setInterval( () => socket.emit( 'presence:sync' ), 30_000 );
		};

		const	onConnectError = async ( error: Error ) =>
		{
			// Si le JWT a expiré pendant une coupure réseau, /auth/me renouvelle les cookies via le guard existant.
			if ( error.message !== 'Unauthorized' || retriedAuthentication )
				return;

			retriedAuthentication = true;
			await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

			if ( !disposed && queryClient.getQueryData( queryKeys.auth.me() ))
				socket.connect();
		};

		const	onSnapshot = ( snapshot: PresenceSnapshot ) =>
		{
			queryClient.setQueryData<PresenceMap>( queryKey, snapshot.statuses );
		};

		const	onPresenceChange = ( change: PresenceChange ) =>
		{
			queryClient.setQueryData<PresenceMap>( queryKey, ( current = {} ) =>
				({ ...current, [ change.userId ]: change.isOnline })
			);
		};

		const	onDisconnect = () =>
		{
			window.clearInterval( syncInterval );
			queryClient.setQueryData<PresenceMap>( queryKey, {} );
		};

		socket.on( 'connect', onConnect );
		socket.on( 'connect_error', onConnectError );
		socket.on( 'presence:snapshot', onSnapshot );
		socket.on( 'presence:changed', onPresenceChange );
		socket.on( 'disconnect', onDisconnect );
		socket.connect();

		return () =>
		{
			disposed = true;
			window.clearInterval( syncInterval );
			socket.off( 'connect', onConnect );
			socket.off( 'connect_error', onConnectError );
			socket.off( 'presence:snapshot', onSnapshot );
			socket.off( 'presence:changed', onPresenceChange );
			socket.off( 'disconnect', onDisconnect );
			socket.disconnect();
			queryClient.setQueryData<PresenceMap>( queryKey, {} );
		};
	}, [ loading, user?.id, queryClient ]);
}

export function PresenceConnection(): null
{
	usePresenceConnection();
	return ( null );
}
