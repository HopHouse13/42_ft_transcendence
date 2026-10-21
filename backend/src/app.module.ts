import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
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
import { FriendModule } from './friend/friend.module';
import { SpectatorModule } from './spectator/spectator.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AchievementModule } from './achievement/achievement.module';
import { PresenceModule } from './presence/presence.module';
import { EloModule } from './elo/elo.module';

@Module({
  imports: [
    MonitoringModule,
    HealthModule,
    PrismaModule,
    UserModule,
    OthelloModule,
    GameRoomModule,
    AuthModule,
    ComputePlayerModule,
    ChatModule,
    FriendModule,
    SpectatorModule,
    AchievementModule,
	  PresenceModule,
    LeaderboardModule,
    EloModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, OthelloService], // voir si PrismaService et OthelloService sont utiles ici
})
export class AppModule {}
