import { Test, TestingModule } from '@nestjs/testing';
import { MultilevelService } from './multilevel.service';

describe('MultilevelService', () => {
  let service: MultilevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultilevelService],
    }).compile();

    service = module.get<MultilevelService>(MultilevelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
