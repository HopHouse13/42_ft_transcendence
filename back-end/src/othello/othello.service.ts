import { Injectable } from '@nestjs/common';

@Injectable()
export class OthelloService {
  // TODO: gestion des parties en cours (in-memory ou via DB)
  // TODO: brancher le moteur de jeu (dossier engine/)

  ping() {
    return { module: 'othello', status: 'ready' };
  }
}
