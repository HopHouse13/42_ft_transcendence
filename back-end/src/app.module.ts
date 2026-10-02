import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { OthelloModule } from './othello/othello.module';
import { AuthModule } from './auth/auth.module';
import { GameRoomModule } from './game-room/game-room.module';
import { PrismaService } from './prisma/prisma.service';
import { OthelloService } from './othello/othello.service';
import { ComputePlayerModule } from './compute-player/compute-player.module';
import { ChatModule } from './chat/chat.module';

@Module({

  imports: [ PrismaModule, UserModule, OthelloModule, GameRoomModule, AuthModule, ComputePlayerModule, ChatModule ],
  controllers: [ AppController ],
  providers: [ AppService, PrismaService, OthelloService ],
})
export class AppModule {}
