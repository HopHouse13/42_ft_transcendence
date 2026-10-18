// logique code metier
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveGamePayload } from './interfaces/live-game.interface';
import { GameStatus } from '../othello/enums/game-status.enum';

@Injectable()
export class SpectatorService {
  constructor(private prisma: PrismaService) {}

  async getVisibleGames(): Promise<LiveGamePayload[]> {
    // fetch ongoing games from the database
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          { status: 'IN_PROGRESS' },
          // add logic here to fetch games finished within the last 10 min (if tracking timestamps)
        ],
      },
      include: {
        blackPlayer: true, // Pulls the full User model for the black player
        whitePlayer: true, // Prisma executes a SQL `JOIN` under the hood, allowing to access `game.<color>Player.elo` without any extra database calls.
      },
    });

    // map db entities to frontend LiveGame interface
    return games.map((game) => ({
      id: game.id,
      status: GameStatus.IN_PROGRESS,
      currentPlayer: game.currentPlayer === 'BLACK' ? 'BLACK' : 'WHITE',
      spectators: 0,
      duration: '00:00', // placeholder | to calculate
      isBot: false, // placeholder
      board: [], // placeholder | inject actual board stat here
      player1: {
        username: game.blackPlayer.username,
        avatarUrl: game.blackPlayer.avatarUrl,
        color: 'BLACK',
        score: game.blackScore || 2,
        elo: game.blackPlayer.elo,
      },
      player2: {
        username: game.whitePlayer.username,
        avatarUrl: game.whitePlayer.avatarUrl,
        color: 'WHITE',
        score: game.whiteScore || 2,
        elo: game.whitePlayer.elo,
      },
    }));
  }
}
