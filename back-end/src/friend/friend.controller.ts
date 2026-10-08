import { Controller, UseGuards, Get, Post, Param, ParseUUIDPipe, Req, Patch, Delete } from "@nestjs/common";
import { JwtGuard } from "../common/guards/jwt.guard";
import { FriendService } from "./friend.service"; 
import { HttpCode } from "@nestjs/common";
import { FriendLists } from "./interfaces/friend.interface";

@UseGuards( JwtGuard )
@Controller( 'friend' )
export class FriendController
{
	constructor( private readonly friendService: FriendService ) {};

	@Post( ':receiverId' )
	@HttpCode( 204 ) // status de reussite mais rien a envoyer
	sendRequest( @Req() req, @Param( "receiverId", ParseUUIDPipe ) receiverId: string )
	{
		return( this.friendService.sendRequest( req.user.id, receiverId ));
	}

	///

	@Patch( ':senderId/accepted' )
	@HttpCode( 204 )
	accept( @Req() req, @Param( "senderId", ParseUUIDPipe ) senderId: string )
	{
		return( this.friendService.accept( req.user.id, senderId ));
	}

	///

	@Delete( ':otherId' )
	@HttpCode( 204 )
	delete( @Req() req, @Param( "otherId", ParseUUIDPipe ) otherId: string )
	{
		return( this.friendService.delete( req.user.id, otherId ));
	}

	///

	@Get()
	friendLists( @Req() req ): Promise <FriendLists>
	{
		return( this.friendService.friendLists( req.user.id ));
	}

	///

	//@Get()
};