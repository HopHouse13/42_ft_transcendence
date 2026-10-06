import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports:[ AuthModule ],
	providers:[ FriendService ],
	controllers:[ FriendController ],
	exports:[ FriendService ]
})
export class FriendModule {};