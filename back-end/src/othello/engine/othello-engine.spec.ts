import { OthelloEngine } from './othello-engine';

describe('OthelloEngine', () => {

  describe('état initial', () => {
    it('BLACK commence la partie', () => {
      const engine = new OthelloEngine();
      expect(engine.getCurrentPlayer()).toBe('BLACK');
    });

    it('le plateau initial a bien les 4 pions de départ', () => {
      const engine = new OthelloEngine();
      const board = engine.getBoard();
      expect(board.getCell(3, 3)).toBe('WHITE');
      expect(board.getCell(3, 4)).toBe('BLACK');
      expect(board.getCell(4, 3)).toBe('BLACK');
      expect(board.getCell(4, 4)).toBe('WHITE');
    });
  });

  describe('isValidMove', () => {
    it('refuse un coup sur une case déjà occupée', () => {
      const engine = new OthelloEngine();
      expect(engine.isValidMove({ row: 3, col: 3 }, 'BLACK')).toBe(false);
    });

    it('refuse un coup qui ne capture aucun pion', () => {
      const engine = new OthelloEngine();
      // coin, loin de toute capture possible en début de partie
      expect(engine.isValidMove({ row: 0, col: 0 }, 'BLACK')).toBe(false);
    });

    it('accepte un coup valide classique pour BLACK en ouverture', () => {
      const engine = new OthelloEngine();
      // à vérifier manuellement selon ta convention row/col
      expect(engine.isValidMove({ row: 2, col: 3 }, 'BLACK')).toBe(true);
    });

    it('refuse un coup hors limites du plateau', () => {
      const engine = new OthelloEngine();
      expect(engine.isValidMove({ row: -1, col: 0 }, 'BLACK')).toBe(false);
    });
  });

  describe('allValidMove', () => {
    it('BLACK a exactement 4 coups valides en tout début de partie', () => {
      const engine = new OthelloEngine();
      const moves = engine.allValidMove('BLACK');
      expect(moves.length).toBe(4);
    });

    it('WHITE a aussi exactement 4 coups valides en tout début de partie', () => {
      const engine = new OthelloEngine();
      const moves = engine.allValidMove('WHITE');
      expect(moves.length).toBe(4);
    });
  });

  describe('playMove', () => {
    it('pose le pion à la position jouée', () => {
      const engine = new OthelloEngine();
      engine.playMove({ row: 2, col: 3 }, 'BLACK');
      expect(engine.getBoard().getCell(2, 3)).toBe('BLACK');
    });

    it('retourne bien le(s) pion(s) capturé(s)', () => {
      const engine = new OthelloEngine();
      engine.playMove({ row: 2, col: 3 }, 'BLACK');
      // le WHITE en (3,3) doit être retourné en BLACK
      expect(engine.getBoard().getCell(3, 3)).toBe('BLACK');
    });

    it('passe la main au joueur adverse après un coup', () => {
      const engine = new OthelloEngine();
      engine.playMove({ row: 2, col: 3 }, 'BLACK');
      expect(engine.getCurrentPlayer()).toBe('WHITE');
    });

    it('lève une erreur si on joue un coup invalide', () => {
      const engine = new OthelloEngine();
      expect(() => engine.playMove({ row: 0, col: 0 }, 'BLACK')).toThrow();
    });

    it('lève une erreur si on joue hors de son tour', () => {
      const engine = new OthelloEngine();
      // c'est BLACK qui doit jouer, pas WHITE
      expect(() => engine.playMove({ row: 2, col: 4 }, 'WHITE')).toThrow();
    });
  });

  describe('isGameOver', () => {
    it('la partie n\'est pas finie au début', () => {
      const engine = new OthelloEngine();
      expect(engine.isGameOver()).toBe(false);
    });

    it.todo('détecte la fin de partie quand aucun joueur ne peut jouer');
  });

  describe('returnResult', () => {
    it('compte correctement les pions en tout début de partie', () => {
      const engine = new OthelloEngine();
      const result = engine.returnResult();
      expect(result.blackCount).toBe(2);
      expect(result.whiteCount).toBe(2);
    });
  });

});
