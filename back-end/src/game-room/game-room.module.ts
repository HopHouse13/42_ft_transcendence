import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomGateway } from './game-room.gateway';
import { GameRoomController } from './game-room.controller';

import { OthelloService } from '../othello/othello.service';
import { PrismaService } from '../prisma/prisma.service';


@Module({

    providers: [GameRoomService, GameRoomGateway, OthelloService, PrismaService],
    controllers: [GameRoomController],
    exports:[GameRoomService]
})
export class GameRoomModule {}
