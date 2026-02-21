import { Injectable } from '@nestjs/common';
import { CountryService } from '../../country/service/country.service'
import { ScoringEngine } from '../scoring/scoring.engine';
import { RecommendationResult, TravelPreferences } from '../types/recommendation.types';

@Injectable()
export class RecommendationService {
    constructor(
        private readonly countryService : CountryService,
        private readonly scoringEngine : ScoringEngine
    ) {}

    async recommendCountries(preferences : TravelPreferences) : Promise<RecommendationResult[]> {
        const countries = await this.countryService.getAllCountriesWithProfiles();
        return this.scoringEngine.compute(preferences, countries);
    }
}
