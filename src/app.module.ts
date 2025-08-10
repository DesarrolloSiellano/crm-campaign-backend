import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { PopulationModule } from './population/population.module';
import { LeadersModule } from './leaders/leaders.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], 
    }),
    DatabaseModule,
    PopulationModule,
    LeadersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
