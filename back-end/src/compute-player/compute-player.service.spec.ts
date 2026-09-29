import { Test, TestingModule } from '@nestjs/testing';
import { ComputePlayerService } from './compute-player.service';

describe('ComputePlayerService', () => {
  let service: ComputePlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComputePlayerService],
    }).compile();

    service = module.get<ComputePlayerService>(ComputePlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
