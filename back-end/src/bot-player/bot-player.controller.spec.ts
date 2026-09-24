import { Test, TestingModule } from '@nestjs/testing';
import { BotPlayerController } from './bot-player.controller';

describe('BotPlayerController', () => {
  let controller: BotPlayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotPlayerController],
    }).compile();

    controller = module.get<BotPlayerController>(BotPlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
