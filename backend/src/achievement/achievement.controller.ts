import { Controller, Param, ParseUUIDPipe, UseGuards, Get } from "@nestjs/common";
import { JwtGuard } from "../common/guards/jwt.guard";
import { AchievementService } from "./achievement.service";

@UseGuards( JwtGuard )
@Controller( 'achievement' )
export class AchievementController
{
	constructor( private readonly achievementService : AchievementService ) {};

	@Get( ':rawId' )
	findAchievement( @Param( 'rawId', ParseUUIDPipe ) rawId: string)
	{
		return( this.achievementService.findAchievement( rawId ));
	}
};