import { Test, TestingModule } from '@nestjs/testing';
import { PopulationController } from './population.controller';
import { PopulationService } from './population.service';

describe('PopulationController', () => {
  let controller: PopulationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopulationController],
      providers: [PopulationService],
    }).compile();

    controller = module.get<PopulationController>(PopulationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
