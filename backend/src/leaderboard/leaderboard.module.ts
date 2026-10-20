import { Module } from "@nestjs/common";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [ AuthModule ], 
	controllers: [ LeaderboardController ],
	providers: [ LeaderboardService ]
})
export class LeaderboardModule {} ;