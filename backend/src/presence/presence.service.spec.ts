import { PresenceService } from './presence.service';

describe( 'PresenceService', () =>
{
	let	service: PresenceService;

	beforeEach( () =>
	{
		service = new PresenceService();
	});

	it( 'keeps a user online until the last socket disconnects', () =>
	{
		expect( service.addSocket( 'user-1', 'socket-1' )).toBe( true );
		expect( service.addSocket( 'user-1', 'socket-2' )).toBe( false );
		expect( service.isOnline( 'user-1' )).toBe( true );

		expect( service.removeSocket( 'user-1', 'socket-1' )).toBe( false );
		expect( service.isOnline( 'user-1' )).toBe( true );
		expect( service.removeSocket( 'user-1', 'socket-2' )).toBe( true );
		expect( service.isOnline( 'user-1' )).toBe( false );
	});

	it( 'does not treat an unknown socket as a disconnect', () =>
	{
		expect( service.removeSocket( 'user-1', 'unknown-socket' )).toBe( false );
		expect( service.isOnline( 'user-1' )).toBe( false );
	});
});
