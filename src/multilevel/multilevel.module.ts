import { Module } from '@nestjs/common';
import { MultilevelService } from './multilevel.service';
import { MultilevelController } from './multilevel.controller';

@Module({
  controllers: [MultilevelController],
  providers: [MultilevelService],
})
export class MultilevelModule {}
