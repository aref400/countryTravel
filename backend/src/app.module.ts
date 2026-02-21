import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CountryModule } from './country/country.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CountryModule,
    RecommendationModule,
  ],
})
export class AppModule {}
