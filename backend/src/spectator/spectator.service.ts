import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServerCell, LiveGamePayload } from './interfaces/live-game.interface';
import { GameStatus } from '../othello/enums/game-status.enum';
import { Game, User, Move } from '@prisma/client';

// define database query returns
// & = Intersection Type operator meaning "AND"
// "Create a brand new type that requires ALL the properties of the Prisma Game type, AND ALL the properties of this custom object."
type GameWithRelations = Game & {
  blackPlayer: User;
  whitePlayer: User;
  moves: Move[];
};

@Injectable()
export class SpectatorService {
  constructor(private prisma: PrismaService) {}

  private formateGamePayload(game: GameWithRelations): LiveGamePayload {
    const latestMove = game.moves[0]; // Will be undefined if no moves have been played yet

    // standard Othello starting board
    const DEFAULT_BOARD_STR =
      '---------------------------WB------BW---------------------------';

    const boardString = latestMove ? latestMove.boardAfter : DEFAULT_BOARD_STR;
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
  }

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

    return games.map((game) => this.formateGamePayload(game));
  }

  async getSingleGame(gameId: string): Promise<LiveGamePayload | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        blackPlayer: true,
        whitePlayer: true,
        moves: { orderBy: { moveNumber: 'desc' }, take: 1 },
      },
    });

    if (!game) return null;

    return this.formateGamePayload(game);
  }
}
