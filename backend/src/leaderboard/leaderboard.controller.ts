import { Controller, Get, UseGuards } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { JwtGuard } from "../common/guards/jwt.guard";
@Controller( 'leaderboard' )
export class LeaderboardController
{

	constructor( private readonly leaderboardService : LeaderboardService ) {};

	@Get()
	@UseGuards( JwtGuard )
	leaderboard()
	{
		return ( this.leaderboardService.findLeaderboard() );
	}
};