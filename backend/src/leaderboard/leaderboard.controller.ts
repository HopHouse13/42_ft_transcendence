import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { SilentJwtGuard } from "../common/guards/silentJwt.guard";

@Controller( 'leaderboard' )
export class LeaderboardController
{

	constructor( private readonly leaderboardService : LeaderboardService ) {};

	@Get()
	@UseGuards( SilentJwtGuard )
	leaderboard(@Req() request: any )
	{
		return ( this.leaderboardService.findLeaderboard( request.user?.id ));
	}
};