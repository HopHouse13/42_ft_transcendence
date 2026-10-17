import { Module } from "@nestjs/common";
import { AchievementController } from "./achievement.controller";
import { AchievementService } from "./achievement.service";
import { AuthModule } from "../auth/auth.module";

@Module(
	{
		imports:[ AuthModule ],
		providers: [ AchievementService ],
		controllers: [ AchievementController ],
		exports: [ AchievementService ]
	}
)

export class AchievementModule {};