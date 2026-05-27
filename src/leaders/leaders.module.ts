import { Module } from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { LeadersController } from './leaders.controller';

@Module({
  controllers: [LeadersController],
  providers: [LeadersService],
})
export class LeadersModule {}
