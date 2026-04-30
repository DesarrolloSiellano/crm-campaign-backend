import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { PopulationModule } from './population/population.module';
import { LeadersModule } from './leaders/leaders.module';
import { ConfigModule } from '@nestjs/config';
import { MultilevelModule } from './multilevel/multilevel.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TcpClientModule } from './core/tcp/tcp.module';
import { StrategyJwtGlobalModule } from './core/modules/strategyJwtModule.module';
import { AuthModule } from './core/modules/auth.module';
import { EventsModule } from './events/events.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    TcpClientModule,
    StrategyJwtGlobalModule,
    PopulationModule,
    LeadersModule,
    CampaignsModule,
    MultilevelModule,
    CampaignsModule,
    AuthModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
