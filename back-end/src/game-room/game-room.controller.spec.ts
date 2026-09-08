import { Test, TestingModule } from '@nestjs/testing';

import { GameRoomController } from './game-room.controller';
import { GameRoomService, PlayerRoom } from './game-room.service';

/* -------------------------------------------------------------------------- */
/*                              ~~ Helpers ~~                                 */
/* -------------------------------------------------------------------------- */

const makePlayer = (overrides: Partial<PlayerRoom> = {}): PlayerRoom => ({
    userId: 'user-1',
    socketId: 'socket-1',
    ...overrides,
});

/* -------------------------------------------------------------------------- */
/*                     ~~ Test Suite: GameRoomController ~~                   */
/* -------------------------------------------------------------------------- */

describe('GameRoomController', () => {
    let controller: GameRoomController;
    let gameRoomService: {
        newPlayerEntry: jest.Mock;
        invitPlayerEnty: jest.Mock;
    };

    beforeEach(async () => {

        gameRoomService = {
            newPlayerEntry: jest.fn(),
            invitPlayerEnty: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameRoomController],
            providers: [
                { provide: GameRoomService, useValue: gameRoomService },
            ],
        }).compile();

        controller = module.get<GameRoomController>(GameRoomController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait être défini', () => {
        expect(controller).toBeDefined();
    });

    /* ---------------------------------------------------------------------- */
    /*                        POST /game-room/entry                          */
    /* ---------------------------------------------------------------------- */

    describe('newPlayerEntry', () => {

        it('appelle gameRoomService.newPlayerEntry avec le joueur et retourne son résultat', () => {

            const player = makePlayer({ userId: 'user-1' });

            gameRoomService.newPlayerEntry.mockReturnValue('room-id-123');

            const result = controller.newPlayerEntry(player);

            expect(gameRoomService.newPlayerEntry).toHaveBeenCalledTimes(1);
            expect(gameRoomService.newPlayerEntry).toHaveBeenCalledWith(player);
            expect(result).toBe('room-id-123');
        });
    });

    /* ---------------------------------------------------------------------- */
    /*                        POST /game-room/invit                          */
    /* ---------------------------------------------------------------------- */

    describe('invitPlayerEnty', () => {

        it('appelle gameRoomService.invitPlayerEnty avec le joueur et retourne son résultat', () => {

            const player = makePlayer({ userId: 'user-2', invit: 'room-id-123' });

            gameRoomService.invitPlayerEnty.mockReturnValue({ id: 'game-1' });

            const result = controller.invitPlayerEnty(player);

            expect(gameRoomService.invitPlayerEnty).toHaveBeenCalledTimes(1);
            expect(gameRoomService.invitPlayerEnty).toHaveBeenCalledWith(player);
            expect(result).toEqual({ id: 'game-1' });
        });
    });
});
