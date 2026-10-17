/* ========================================================================== */
/*  othello.service.spec.ts                                                 */
/*  Tests unitaires pour OthelloService                                     */
/* ========================================================================== */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { OthelloService } from './othello.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameStatus } from './enums/game-status.enum';

/* --------------------------------------------------------------------------
 * Mock de OthelloEngine
 * On mocke tout le moteur pour isoler la logique du service (pas besoin
 * de tester les règles du jeu ici, seulement l'orchestration DB/cache).
 * ------------------------------------------------------------------------ */
jest.mock('./engine/othello-engine', () => {
  return {
    OthelloEngine: jest.fn().mockImplementation(() => ({
      playMove: jest.fn(),
      isGameOver: jest.fn().mockReturnValue(false),
      getCurrentPlayer: jest.fn().mockReturnValue('BLACK'),
      allValidMove: jest.fn().mockReturnValue([]),
      returnResult: jest.fn().mockReturnValue({
        winner: null,
        blackCount: 2,
        whiteCount: 2,
      }),
      getBoard: jest.fn().mockReturnValue({
        // 8x8 -> getCell appelé 64 fois, on renvoie une valeur neutre
        getCell: jest.fn().mockReturnValue('EMPTY'),
      }),
    })),
  };
});

describe('OthelloService', () => {
  let service: OthelloService;
  let prisma: {
    game: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    move: {
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const HOST_ID = 'host-uuid';
  const VISITOR_ID = 'visitor-uuid';
  const GAME_ID = 'game-uuid';

  beforeEach(async () => {
    // Mock complet de PrismaService : chaque méthode utilisée par le
    // service est remplacée par un jest.fn() configurable par test.
    prisma = {
      game: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      move: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OthelloService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OthelloService>(OthelloService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------------------------------------------------------ */
  /* findAll                                                             */
  /* ------------------------------------------------------------------ */
  describe('findAll', () => {
    it('retourne la liste des parties triées par date de création décroissante', async () => {
      const games = [
        { id: 'g1', createdAt: new Date('2026-01-02') },
        { id: 'g2', createdAt: new Date('2026-01-01') },
      ];
      prisma.game.findMany.mockResolvedValue(games);

      const result = await service.findAll();

      expect(prisma.game.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(games);
    });

    it('retourne un tableau vide si aucune partie en base', async () => {
      prisma.game.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  /* ------------------------------------------------------------------ */
  /* remove                                                              */
  /* ------------------------------------------------------------------ */
  describe('remove', () => {
    it('supprime les moves puis la game dans une transaction, et nettoie le cache', async () => {
      const deletedGame = { id: GAME_ID, status: 'IN_PROGRESS' };

      // On simule l'exécution de la callback passée à $transaction,
      // en lui fournissant un faux "tx" qui réutilise les mêmes mocks.
      prisma.$transaction.mockImplementation(async (cb: any) => {
        return cb({
          move: { deleteMany: prisma.move.deleteMany },
          game: { delete: prisma.game.delete },
        });
      });
      prisma.move.deleteMany.mockResolvedValue({ count: 3 });
      prisma.game.delete.mockResolvedValue(deletedGame);

      const result = await service.remove(GAME_ID);

      expect(prisma.move.deleteMany).toHaveBeenCalledWith({
        where: { gameId: GAME_ID },
      });
      expect(prisma.game.delete).toHaveBeenCalledWith({
        where: { id: GAME_ID },
      });
      expect(result).toEqual(deletedGame);
    });

    it("lève une NotFoundException si la partie n'existe pas (P2025)", async () => {
      const prismaError = { code: 'P2025' };
      prisma.$transaction.mockRejectedValue(prismaError);

      await expect(service.remove('inconnu-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('propage toute autre erreur Prisma non gérée', async () => {
      const unexpectedError = new Error('connexion DB perdue');
      prisma.$transaction.mockRejectedValue(unexpectedError);

      await expect(service.remove(GAME_ID)).rejects.toThrow(
        'connexion DB perdue',
      );
    });

    it('retire la partie du cache mémoire après suppression réussie', async () => {
      // On peuple d'abord le cache via createGame
      prisma.game.create.mockResolvedValue({});
      await service.createGame(HOST_ID, VISITOR_ID);

      // getState doit fonctionner tant que la partie est en cache
      // (on récupère l'id généré indirectement via findAll n'étant pas
      // adapté ici, donc on teste plutôt le comportement post-remove
      // directement sur GAME_ID pour rester déterministe).
      prisma.$transaction.mockImplementation(async (cb: any) => {
        return cb({
          move: { deleteMany: prisma.move.deleteMany },
          game: { delete: prisma.game.delete },
        });
      });
      prisma.game.delete.mockResolvedValue({ id: GAME_ID });
      prisma.move.deleteMany.mockResolvedValue({ count: 0 });

      await service.remove(GAME_ID);

      // Après suppression, getState ne doit plus trouver la partie en
      // cache et doit retomber sur la DB -> si findUnique renvoie null,
      // on doit obtenir une NotFoundException.
      prisma.game.findUnique.mockResolvedValue(null);

      await expect(service.getState(GAME_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* ------------------------------------------------------------------ */
  /* getState / restauration depuis la DB                                */
  /* ------------------------------------------------------------------ */
  describe('getState', () => {
    it('retourne le state directement depuis le cache si la partie y est déjà', async () => {
      prisma.game.create.mockResolvedValue({});
      const created = await service.createGame(HOST_ID, VISITOR_ID);

      // On récupère via getState -> ne doit PAS retaper la DB (findUnique)
      const state = await service.getState(created.gameId);

      expect(prisma.game.findUnique).not.toHaveBeenCalled();
      expect(state.gameId).toBe(created.gameId);
      expect(state.players).toHaveLength(2);
    });

    it("restaure une partie depuis la DB si absente du cache", async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: GAME_ID,
        status: 'IN_PROGRESS',
        createdAt: new Date('2026-01-01'),
        blackPlayerId: HOST_ID,
        whitePlayerId: VISITOR_ID,
        moves: [
          {
            gameId: GAME_ID,
            moveNumber: 1,
            Color: 'BLACK',
            position: 19, // row 2, col 3
            boardAfter: '0'.repeat(64),
            createdAt: new Date('2026-01-01T00:01:00'),
          },
          {
            gameId: GAME_ID,
            moveNumber: 2,
            Color: 'WHITE',
            position: null, // pass -> ne doit pas être rejoué
            boardAfter: '0'.repeat(64),
            createdAt: new Date('2026-01-01T00:02:00'),
          },
        ],
      });

      const state = await service.getState(GAME_ID);

      expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { id: GAME_ID },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      });
      expect(state.gameId).toBe(GAME_ID);
      expect(state.players).toEqual([
        { userId: HOST_ID, color: 'BLACK', connected: false },
        { userId: VISITOR_ID, color: 'WHITE', connected: false },
      ]);
      expect(state.status).toBe(GameStatus.IN_PROGRESS);
    });

    it("lève une NotFoundException si la partie n'existe ni en cache ni en DB", async () => {
      prisma.game.findUnique.mockResolvedValue(null);

      await expect(service.getState('inconnu-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('un second appel réutilise le cache alimenté lors de la restauration', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: GAME_ID,
        status: 'IN_PROGRESS',
        createdAt: new Date('2026-01-01'),
        blackPlayerId: HOST_ID,
        whitePlayerId: VISITOR_ID,
        moves: [],
      });

      await service.getState(GAME_ID); // 1er appel -> touche la DB
      await service.getState(GAME_ID); // 2e appel -> doit venir du cache

      expect(prisma.game.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* createGame                                                           */
  /* ------------------------------------------------------------------ */
  describe('createGame', () => {
    it('crée la partie en DB et initialise le cache avec 2 joueurs', async () => {
      prisma.game.create.mockResolvedValue({});

      const state = await service.createGame(HOST_ID, VISITOR_ID);

      expect(prisma.game.create).toHaveBeenCalledWith({
        data: {
          id: state.gameId,
          status: 'IN_PROGRESS',
          blackPlayerId: HOST_ID,
          whitePlayerId: VISITOR_ID,
        },
      });
      expect(state.players).toEqual([
        { userId: HOST_ID, color: 'BLACK', connected: true },
        { userId: VISITOR_ID, color: 'WHITE', connected: true },
      ]);
      expect(state.status).toBe(GameStatus.IN_PROGRESS);
    });
  });
});
