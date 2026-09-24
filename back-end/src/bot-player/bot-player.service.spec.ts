import { Test, TestingModule } from '@nestjs/testing';
import { BotPlayerService } from './bot-player.service';

describe('BotPlayerService', () => {
  let service: BotPlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotPlayerService],
    }).compile();

    service = module.get<BotPlayerService>(BotPlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
