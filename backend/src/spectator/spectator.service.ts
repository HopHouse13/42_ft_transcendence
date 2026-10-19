// logique code metier
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServerCell, LiveGamePayload } from './interfaces/live-game.interface';
import { GameStatus } from '../othello/enums/game-status.enum';

@Injectable()
export class SpectatorService {
  constructor(private prisma: PrismaService) {}

  async getVisibleGames(): Promise<LiveGamePayload[]> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // fetch ongoing games from the database
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          { status: 'IN_PROGRESS' },
          {
            status: 'FINISHED',
            updatedAt: { gte: tenMinutesAgo },
          },
        ],
      },
      include: {
        blackPlayer: true, // Pulls the full User model for the black player
        whitePlayer: true, // Prisma executes a SQL `JOIN` under the hood, allowing to access `game.<color>Player` without any extra database calls.
        moves: {
          orderBy: { moveNumber: 'desc' },
          take: 1, // latest move
        },
      },
    });

    // standard Othello starting board
    const DEFAULT_BOARD_STR =
      '---------------------------WB------BW---------------------------';

    // map db entities to frontend LiveGame interface
    return games.map((game) => {
      const latestMove = game.moves[0];
      // Will be undefined if no moves have been played yet

      const boardString = latestMove
        ? latestMove.boardAfter
        : DEFAULT_BOARD_STR;
      const reconstructedBoard = boardString.split('').map((char) => {
        if (char === 'B') return 'BLACK';
        if (char === 'W') return 'WHITE';
        return 'EMPTY';
      }) as ServerCell[];

      const currentBlackScore = reconstructedBoard.filter(
        (c) => c === 'BLACK',
      ).length;
      const currentWhiteScore = reconstructedBoard.filter(
        (c) => c === 'WHITE',
      ).length;

      const currentTurn = latestMove
        ? latestMove.Color === 'BLACK'
          ? 'WHITE'
          : 'BLACK'
        : 'BLACK';

      // calculate a static duration (once) ONLY if the game is finished
      let staticDuration = '00:00';
      if (game.status === 'FINISHED') {
        const diffInSeconds = Math.floor(
          (game.updatedAt.getTime() - game.createdAt.getTime()) / 1000,
        );
        const m = Math.floor(diffInSeconds / 60)
          .toString()
          .padStart(2, '0');
        const s = (diffInSeconds % 60).toString().padStart(2, '0');
        staticDuration = `${m}:${s}`;
      }

      return {
        gameId: game.id,
        status: game.status as GameStatus, // use the actual database status
        currentPlayer: currentTurn,
        spectators: 0,
        startedAt: game.createdAt.toISOString(),
        duration: staticDuration,
        isBot: false, // placeholder
        board: reconstructedBoard,

        player1: {
          username: game.blackPlayer.username,
          avatarUrl: game.blackPlayer.avatarUrl,
          color: 'BLACK',
          score: currentBlackScore,
          elo: game.blackPlayer.elo,
        },
        player2: {
          username: game.whitePlayer.username,
          avatarUrl: game.whitePlayer.avatarUrl,
          color: 'WHITE',
          score: currentWhiteScore,
          elo: game.whitePlayer.elo,
        },
      };
    });
  }
}
