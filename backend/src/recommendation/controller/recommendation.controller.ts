import { Body, Controller, Post } from '@nestjs/common';
import { RecommendationService } from '../service/recommendation.service';
import { TravelPreferencesDto } from '../dto/travel-preferences.dto';
import { RecommendationResult } from '../types/recommendation.types';

@Controller('recommendation')
export class RecommendationController {
    constructor(
        private readonly recommendationService : RecommendationService
    ) {}

    @Post()
    async recommendCountries(@Body() preferences : TravelPreferencesDto) : Promise<RecommendationResult[]> {
        return this.recommendationService.recommendCountries(preferences);
    }
}
