import { Module } from '@nestjs/common';
import { RecommendationService } from './service/recommendation.service';
import { RecommendationController } from './controller/recommendation.controller';
import { ScoringEngine } from './scoring/scoring.engine';
import { CountryModule } from '../country/country.module';

@Module({
  imports: [CountryModule],
  providers: [RecommendationService, ScoringEngine],
  controllers: [RecommendationController]
})
export class RecommendationModule {}
