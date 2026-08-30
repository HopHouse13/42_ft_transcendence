import { OthelloService } from './othello.service';
import { GameStatus } from './enums/game-status.enum';

describe('OthelloService', () => {
  let service: OthelloService;

  // beforeEach : on repart d'un service tout neuf avant CHAQUE test,
  // pour que les tests ne se marchent pas dessus (pas de partie qui "fuit"
  // d'un test à l'autre).
  beforeEach(() => {
    service = new OthelloService();
  });

  describe('createGame', () => {
    it('crée une partie en attente avec un seul joueur en BLACK', () => {
      const state = service.createGame('alice');

      expect(state.status).toBe(GameStatus.WAITING);
      expect(state.players).toHaveLength(1);
      expect(state.players[0].color).toBe('BLACK');
      expect(state.currentPlayer).toBe('BLACK');
      expect(state.validMoves).toHaveLength(4);
    });
  });

  describe('joinGame', () => {
    it('ajoute un second joueur en WHITE et passe la partie en IN_PROGRESS', () => {
      const created = service.createGame('alice');
      const state = service.joinGame(created.gameId, 'bob');

      expect(state.status).toBe(GameStatus.IN_PROGRESS);
      expect(state.players).toHaveLength(2);
      expect(state.players[1].color).toBe('WHITE');
    });

    it('refuse un troisième joueur', () => {
      const created = service.createGame('alice');
      service.joinGame(created.gameId, 'bob');

      expect(() => service.joinGame(created.gameId, 'charlie')).toThrow();
    });

    it('refuse de rejoindre une partie inexistante', () => {
      expect(() => service.joinGame('id-inconnu', 'bob')).toThrow();
    });
  });

  describe('playMove', () => {
    // Petit helper pour éviter de répéter createGame + joinGame dans chaque test
    function setupGame() {
      const created = service.createGame('alice');
      service.joinGame(created.gameId, 'bob');
      return created.gameId;
    }

    it('joue un coup valide et retourne bien le plateau mis à jour', () => {
      const gameId = setupGame();

      const result = service.playMove(gameId, 'alice', { row: 2, col: 3 });

      expect(result.valid).toBe(true);
      expect(result.nextPlayer).toBe('WHITE');
      expect(result.board).toHaveLength(64);
      expect(result.board![2 * 8 + 3]).toBe('BLACK'); // la case jouée
      expect(result.board![3 * 8 + 3]).toBe('BLACK'); // le pion retourné
    });

    it('refuse un coup joué hors tour', () => {
      const gameId = setupGame();
      service.playMove(gameId, 'alice', { row: 2, col: 3 });

      // c'est au tour de bob, alice ne peut pas rejouer
      const result = service.playMove(gameId, 'alice', { row: 2, col: 2 });

      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('refuse un coup sur une case déjà occupée', () => {
      const gameId = setupGame();

      const result = service.playMove(gameId, 'bob', { row: 3, col: 3 });

      expect(result.valid).toBe(false);
    });

    it("refuse un coup joué par un userId qui ne fait pas partie de la partie", () => {
      const gameId = setupGame();

      const result = service.playMove(gameId, 'mallory', { row: 0, col: 0 });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('mallory');
    });
  });

  describe('getState', () => {
    it('lève une erreur pour une partie inexistante', () => {
      expect(() => service.getState('id-inconnu')).toThrow();
    });

    it('reflète le joueur courant après un coup joué', () => {
      const created = service.createGame('alice');
      service.joinGame(created.gameId, 'bob');
      service.playMove(created.gameId, 'alice', { row: 2, col: 3 });

      const state = service.getState(created.gameId);

      expect(state.currentPlayer).toBe('WHITE');
    });
  });

  describe('markDisconnected', () => {
    it('marque le bon joueur comme déconnecté', () => {
      const created = service.createGame('alice');
      service.joinGame(created.gameId, 'bob');

      service.markDisconnected(created.gameId, 'bob');
      const state = service.getState(created.gameId);

      const bob = state.players.find((p) => p.userId === 'bob');
      expect(bob?.connected).toBe(false);
    });
  });
});
