import { Test, TestingModule } from '@nestjs/testing';
import { BotPlayerGateway } from './bot-player.gateway';

describe('BotPlayerGateway', () => {
  let gateway: BotPlayerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotPlayerGateway],
    }).compile();

    gateway = module.get<BotPlayerGateway>(BotPlayerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
