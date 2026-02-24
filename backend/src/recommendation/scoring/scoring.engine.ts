import { CountrywithProfile } from '../../country/types/country.types';
import {
  CriterionBreakdown,
  RecommendationResult,
  TravelPreferences,
} from '../types/recommendation.types';

export class ScoringEngine {
  private static readonly MAX_SCORE = 5;
  private static readonly DEFAULT_COUNTRY_SCORE = 0;
  private static readonly ALL_REGIONS = 'All';

  private readonly travelTypeToProfileField = {
    nature: 'natureLevel',
    culture: 'cultureLevel',
    party: 'partyLevel',
    sport: 'sportLevel',
  };
  private readonly regionToProfileField = {
    europe: 'Europe',
    asia: 'Asia',
    africa: 'Africa',
    Americas: 'Americas',
    oceania: 'Oceania',
  };

  compute(
    preferences: TravelPreferences,
    countries: CountrywithProfile[],
  ): RecommendationResult[] {
    const filteredCountries = this.filterByRegion(countries, preferences.region);
    
    // 2. Calculer les scores uniquement sur les pays filtrés
    return filteredCountries
      .map((country) => this.calculateSimilarity(preferences, country))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3);
  }

    private filterByRegion(
    countries: CountrywithProfile[],
    selectedRegion: string,
  ): CountrywithProfile[] {
    // Si "Tous" ou région vide, pas de filtrage
    if (!selectedRegion || selectedRegion === ScoringEngine.ALL_REGIONS) {
      return countries;
    }
 
    // Filtrer les pays dont la région correspond (insensible à la casse)
    return countries.filter((country) => 
      this.isRegionMatch(country.region, selectedRegion)
    );
  }
  private isRegionMatch(
    countryRegion: string | null,
    selectedRegion: string,
  ): boolean {
    if (!countryRegion) {
      return false; // Pays sans région = exclu
    }
    return countryRegion.toLowerCase() === selectedRegion.toLowerCase();
  }

   private calculateSimilarity(
    preferences: TravelPreferences,
    country: CountrywithProfile,
  ): RecommendationResult {
    const breakdown: Record<string, CriterionBreakdown> = {};
 
    // Critères de base (toujours évalués)
    this.addBasicCriteria(breakdown, preferences, country);
 
    // Critère famille (conditionnel)
    if (preferences.withChildren) {
      this.addCriterion(
        breakdown,
        'family',
        ScoringEngine.MAX_SCORE,
        country.countryScoreProfiles?.familyFriendlinessLevel,
      );
    }
 
    // Critère mois de voyage
    this.addMonthCriterion(breakdown, preferences, country);
 
    // Critères types de voyage (dynamiques)
    this.addTravelTypeCriteria(breakdown, preferences, country);
 
    // Calcul du score total
    const totalScore = this.calculateTotalScore(breakdown);
 
    return { country, totalScore, breakdown };
  }
 
  private addBasicCriteria(
    breakdown: Record<string, CriterionBreakdown>,
    preferences: TravelPreferences,
    country: CountrywithProfile,
  ): void {
    const basicCriteria = [
      { name: 'budget', userScore: preferences.budget, countryField: 'priceLevel' },
      { name: 'safety', userScore: preferences.safety, countryField: 'safetyLevel' },
      { name: 'climate', userScore: preferences.climate, countryField: 'climateLevel' },
      { name: 'touristPopularity', userScore: preferences.touristPopularity, countryField: 'tourismCrowdLevel' },
    ] as const;
 
    basicCriteria.forEach(({ name, userScore, countryField }) => {
      this.addCriterion(
        breakdown,
        name,
        userScore,
        country.countryScoreProfiles?.[countryField],
      );
    });
  }
 
  private addTravelTypeCriteria(
    breakdown: Record<string, CriterionBreakdown>,
    preferences: TravelPreferences,
    country: CountrywithProfile,
  ): void {
    preferences.travelTypes.forEach((travelType) => {
      const profileField = this.travelTypeToProfileField[travelType];
      const countryScore = country.countryScoreProfiles?.[profileField];
      
      this.addCriterion(
        breakdown,
        travelType,
        ScoringEngine.MAX_SCORE,
        countryScore,
      );
    });
  }
 
  private addMonthCriterion(
    breakdown: Record<string, CriterionBreakdown>,
    preferences: TravelPreferences,
    country: CountrywithProfile,
  ): void {
    const isInOptimalPeriod = this.isMonthInRange(
      preferences.travelMonth,
      country.countryScoreProfiles?.bestMonthsFrom,
      country.countryScoreProfiles?.bestMonthsTo,
    );
 
    breakdown['travelMonth'] = {
      countryScore: ScoringEngine.DEFAULT_COUNTRY_SCORE,
      similarity: isInOptimalPeriod ? ScoringEngine.MAX_SCORE : 0,
    };
  }
 
  private isMonthInRange(
    month: number,
    rangeStart: number | null | undefined,
    rangeEnd: number | null | undefined,
  ): boolean {
    const start = rangeStart ?? 0;
    const end = rangeEnd ?? 0;
    return month >= start && month <= end;
  }
 
  private addCriterion(
    breakdown: Record<string, CriterionBreakdown>,
    name: string,
    userScore: number,
    countryScore: number | null | undefined,
  ): void {
    const normalizedCountryScore = countryScore ?? ScoringEngine.DEFAULT_COUNTRY_SCORE;
    const similarity = this.computeSimilarity(userScore, normalizedCountryScore);
 
    breakdown[name] = {
      countryScore: normalizedCountryScore,
      similarity,
    };
  }
 
  private computeSimilarity(userScore: number, countryScore: number): number {
    return ScoringEngine.MAX_SCORE - Math.abs(userScore - countryScore);
  }
 
  private calculateTotalScore(breakdown: Record<string, CriterionBreakdown>): number {
    const totalSimilarity = Object.values(breakdown).reduce(
      (sum, criterion) => sum + criterion.similarity,
      0,
    );
    return totalSimilarity / Object.values(breakdown).length;
  }
}
