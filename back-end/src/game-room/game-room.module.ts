import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';

import { OthelloService } from '../othello/othello.service';
import { PrismaService } from '../prisma/prisma.service';


@Module({

    providers: [GameRoomService, OthelloService, PrismaService],
    controllers: [GameRoomController],
    exports:[GameRoomService]
})
export class GameRoomModule {}
