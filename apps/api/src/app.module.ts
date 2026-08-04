import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CountriesModule } from './countries/countries.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ScoringModule } from './scoring/scoring.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    // Doit être importé en premier pour instrumenter les autres modules.
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CountriesModule,
    ScoringModule,
    RecommendationsModule,
    VisitsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Capture les exceptions non gérées vers Sentry, puis délègue le rendu de
    // la réponse HTTP au filtre par défaut (comportement d'erreur inchangé).
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
