import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendModule } from '../friend/friend.module';
import { UserModule } from '../user/user.module';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';

@Module({
	imports: [ AuthModule, FriendModule, UserModule ],
	providers: [ PresenceGateway, PresenceService ]
})
export class PresenceModule {}
