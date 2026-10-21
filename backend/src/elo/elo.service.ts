import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { eloDelta, kFactor, MIN_ELO, EloScore } from './elo.util';

@Injectable()
export class EloService {

    async applyGameResult(
        tx: Prisma.TransactionClient,
        game: { id: string; blackPlayerId: string; whitePlayerId: string; winnerId: string | null }
    ) {

        const [black, white] = await Promise.all([
            tx.user.findUniqueOrThrow({ where: { id: game.blackPlayerId }, select: { elo: true } }),
            tx.user.findUniqueOrThrow({ where: { id: game.whitePlayerId }, select: { elo: true } }),
        ]);

        const countGames = (id: string) => tx.game.count({
            where: { status: 'FINISHED', OR: [{ blackPlayerId: id }, { whitePlayerId: id }] }
        });
        const [blackGames, whiteGames] = await Promise.all([
            countGames(game.blackPlayerId),
            countGames(game.whitePlayerId),
        ]);
        
        const blackScore: EloScore = game.winnerId === null ? 0.5 : game.winnerId === game.blackPlayerId ? 1 : 0;
        const whiteScore: EloScore = (1 - blackScore) as EloScore;

        let blackDelta = eloDelta(black.elo, white.elo, blackScore, kFactor(blackGames));
        let whiteDelta = eloDelta(white.elo, black.elo, whiteScore, kFactor(whiteGames));

        blackDelta = Math.max(blackDelta, MIN_ELO - black.elo);
        whiteDelta = Math.max(whiteDelta, MIN_ELO - white.elo);

        await tx.user.update({ 
            where: { id: game.blackPlayerId }, 
            data: { elo: { increment: blackDelta } } 
        });
        
        await tx.user.update({ 
            where: { id: game.whitePlayerId }, 
            data: { elo: { increment: whiteDelta } } 
        });

        return( { blackDelta, whiteDelta } );
    }
}