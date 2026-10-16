import { Prisma } from '@prisma/client';

export type GameWithMoves = Prisma.GameGetPayload<{ include: { moves: true }}>;