import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigService } from '@nestjs/config';
import { PopulationSchema } from 'src/population/entities/population.entity';
import { LeaderSchema } from 'src/leaders/entities/leader.entity';
import { MultilevelSchema } from 'src/multilevel/entities/multilevel.entity';
import { CampaignSchema } from 'src/campaigns/entities/campaign.entity';


@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_URI'), // Lee la URI desde las variables de entorno
          }),
          inject: [ConfigService],
        }),
    MongooseModule.forFeature([
      { name: 'Population', schema: PopulationSchema },
      { name: 'Leader', schema: LeaderSchema },
      { name: 'Multilevel', schema: MultilevelSchema },
      { name: 'Campaign', schema: CampaignSchema },
    ]),
  ],
  exports: [MongooseModule]
})
export class DatabaseModule {}