import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OthelloModule } from './othello/othello.module';

@Module({
  imports: [OthelloModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
