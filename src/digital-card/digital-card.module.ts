import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DigitalCardService } from './digital-card.service';
import { DigitalCardController } from './digital-card.controller';
import { DigitalCard, DigitalCardSchema } from './schemas/digital-card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DigitalCard.name, schema: DigitalCardSchema },
    ]),
  ],
  controllers: [DigitalCardController],
  providers: [DigitalCardService],
  exports: [DigitalCardService],
})
export class DigitalCardModule {}
