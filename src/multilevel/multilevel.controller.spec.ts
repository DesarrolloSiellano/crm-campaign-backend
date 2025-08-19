import { Test, TestingModule } from '@nestjs/testing';
import { MultilevelController } from './multilevel.controller';
import { MultilevelService } from './multilevel.service';

describe('MultilevelController', () => {
  let controller: MultilevelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultilevelController],
      providers: [MultilevelService],
    }).compile();

    controller = module.get<MultilevelController>(MultilevelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
