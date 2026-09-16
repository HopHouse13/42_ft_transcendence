import { OthelloBoard } from './othello-board';

describe('OthelloBoard', () => {

  describe('constructor', () => {
    it('crée un plateau de 64 cases', () => {
      const board = new OthelloBoard();
      // on vérifie indirectement via getCell sur les 4 coins
      expect(board.getCell(0, 0)).toBe('EMPTY');
      expect(board.getCell(7, 7)).toBe('EMPTY');
    });

    it('place les 4 pions de départ correctement', () => {
      const board = new OthelloBoard();
      expect(board.getCell(3, 3)).toBe('WHITE');
      expect(board.getCell(3, 4)).toBe('BLACK');
      expect(board.getCell(4, 3)).toBe('BLACK');
      expect(board.getCell(4, 4)).toBe('WHITE');
    });

    it('laisse toutes les autres cases vides', () => {
      const board = new OthelloBoard();
      expect(board.getCell(0, 0)).toBe('EMPTY');
      expect(board.getCell(5, 5)).toBe('EMPTY');
    });
  });

  describe('getCell / setCell', () => {
    it('setCell modifie bien la valeur lue par getCell', () => {
      const board = new OthelloBoard();
      board.setCell(0, 0, 'BLACK');
      expect(board.getCell(0, 0)).toBe('BLACK');
    });

    it('lève une erreur si row est hors limites', () => {
      const board = new OthelloBoard();
      expect(() => board.getCell(-1, 0)).toThrow();
      expect(() => board.getCell(8, 0)).toThrow();
    });

    it('lève une erreur si col est hors limites', () => {
      const board = new OthelloBoard();
      expect(() => board.getCell(0, -1)).toThrow();
      expect(() => board.getCell(0, 8)).toThrow();
    });

    it('setCell lève aussi une erreur hors limites', () => {
      const board = new OthelloBoard();
      expect(() => board.setCell(8, 8, 'BLACK')).toThrow();
    });
      
    it('getCellSafe renvoie null hors limites au lieu de lever une erreur', () => {
     const board = new OthelloBoard();
     expect(board.getCellSafe(-1, 0)).toBeNull();
     expect(board.getCellSafe(0, 0)).toBe('EMPTY');
   });
  });

  describe('clone', () => {
    it('crée un plateau avec le même contenu', () => {
      const board = new OthelloBoard();
      const copy = board.clone();
      expect(copy.getCell(3, 3)).toBe('WHITE');
      expect(copy.getCell(3, 4)).toBe('BLACK');
    });

    it('est indépendant de l\'original (modifier copy ne change pas board)', () => {
      const board = new OthelloBoard();
      const copy = board.clone();
      copy.setCell(0, 0, 'BLACK');
      expect(board.getCell(0, 0)).toBe('EMPTY'); // original inchangé
      expect(copy.getCell(0, 0)).toBe('BLACK');
    });

    it('est indépendant dans l\'autre sens aussi (modifier board ne change pas copy)', () => {
      const board = new OthelloBoard();
      const copy = board.clone();
      board.setCell(0, 0, 'WHITE');
      expect(copy.getCell(0, 0)).toBe('EMPTY');
    });
  });

});
