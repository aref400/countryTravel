import { CountrywithProfile } from '../../country/types/country.types';
import {
  CriterionBreakdown,
  RecommendationResult,
  TravelPreferences,
} from '../types/recommendation.types';

export class ScoringEngine {
  private readonly travelTypeToProfileField = {
    nature: 'natureLevel',
    culture: 'cultureLevel',
    party: 'partyLevel',
    sport: 'sportLevel',
  };

  compute(
    preferences: TravelPreferences,
    countries: CountrywithProfile[],
  ): RecommendationResult[] {
    return countries
      .map((country) => this.calculateSimilarity(preferences, country))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3);
  }

  private calculateSimilarity(
    preferences: TravelPreferences,
    country: CountrywithProfile,
  ) {
    const breakdown: Record<string, CriterionBreakdown> = {};
    const activeCriteria: Array<{
      name: string;
      userScore: number;
      countryScore: number | null | undefined;
    }> = [];
    activeCriteria.push({
      name: 'budget',
      userScore: preferences.budget,
      countryScore: country.countryScoreProfiles?.priceLevel,
    });
    activeCriteria.push({
      name: 'safety',
      userScore: preferences.safety,
      countryScore: country.countryScoreProfiles?.safetyLevel,
    });
    activeCriteria.push({
      name: 'climate',
      userScore: preferences.climate,
      countryScore: country.countryScoreProfiles?.climateLevel,
    });
    activeCriteria.push({
      name: 'touristPopularity',
      userScore: preferences.touristPopularity,
      countryScore: country.countryScoreProfiles?.tourismCrowdLevel,
    });
    if (preferences.withChildren) {
      activeCriteria.push({
        name: 'family',
        userScore: 5,
        countryScore: country.countryScoreProfiles?.familyFriendlinessLevel,
      });
    }
    const similarityMonths =
      preferences.travelMonth >=
        (country.countryScoreProfiles?.bestMonthsFrom ?? 0) &&
      preferences.travelMonth <=
        (country.countryScoreProfiles?.bestMonthsTo ?? 0)
        ? 5
        : 0;
    preferences.travelTypes.forEach((travel) => {
      const travelType = this.travelTypeToProfileField[travel];
      const travelTypeScore = country.countryScoreProfiles?.[travelType];
      activeCriteria.push({
        name: travel,
        userScore: 5,
        countryScore: travelTypeScore,
      });
    });
    activeCriteria.forEach((criteria) => {
      const similarityScore =
        5 - Math.abs(criteria.userScore - (criteria.countryScore ?? 0));
      breakdown[criteria.name] = {
        countryScore: criteria.countryScore ?? 0,
        similarity: similarityScore,
      };
    });
    breakdown['travelMonth'] = {
      countryScore: 0,
      similarity: similarityMonths,
    };
    const totalSimilarity = Object.values(breakdown).reduce(
      (sum, c) => sum + c.similarity,
      0,
    );
    const totalScore = totalSimilarity / Object.values(breakdown).length;

    return { country, totalScore, breakdown };
  }
}
