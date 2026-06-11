import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { DigitalCardModule } from './digital-card/digital-card.module';
import { ProxyController } from './shared/controllers/proxy.controller';
import { TenantMiddleware } from './core/database/tenant.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { IdempotencyModule } from './core/idempotency/idempotency.module';
import { IdempotencyInterceptor } from './core/interceptors/idempotency.interceptor';
import { DashboardModule } from './dashboard/dashboard.module';

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
    AuthModule,
    EventsModule,
    DigitalCardModule,
    IdempotencyModule,
    DashboardModule,
  ],
  controllers: [AppController, ProxyController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
