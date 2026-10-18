// logique code metier
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveGame } from './interfaces/live-game.interface';

@Injectable()
export class SpectatorService {
  constructor(private prisma: PrismaService) {}

  async getVisibleGames(): Promise<LiveGame[]> {
    // fetch ongoing games from the database
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          { status: 'IN_PROGRESS' },
          // add logic here to fetch games finished within the last 10 min (if tracking timestamps)
        ],
      },
      include: {
        blackPlayer: true,
        whitePlayer: true,
      },
    });

    // map db entities to frontend LiveGame interface
    return games.map((game) => ({
      id: game.id,
      status: game.status,
      turn: game.currentPlayer,
      spectators: 0,
      duration: '10:00', // to calculate
      isBot: false,
      board: [], // inject actual board stat here
      player1: {
        username: game.blackPlayer.username,
        avatarUrl:
          game.blackPlayer.avatarUrl || '/api/uploads/avatars/default.png',
        color: 'Black',
        score: 2, // calculate from board
        // elo: game.blackPlayer.id.elo, // elo not store in games schema but in user schema
      },
      player2: {
        username: game.whitePlayer.username,
        avatarUrl:
          game.whitePlayer.avatarUrl || '/api/uploads/avatar/default.png',
        score: 2, // calculate from board
        // elo: game.whitePlayer.id.elo
      },
    }));
  }
}

// verifier si la partie existe, si elle est en cours?
