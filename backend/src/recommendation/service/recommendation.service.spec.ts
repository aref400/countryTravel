import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { ScoringEngine } from '../scoring/scoring.engine';
import { CountryService } from '../../country/service/country.service';
import FAKE_COUNTRIES from '../../../test/mock/countries_mock';
import FAKE_PREFERENCES from '../../../test/mock/travelPreference_mock';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        ScoringEngine,
        {
          provide: CountryService,
          useValue: {
            getAllCountriesWithProfiles: jest
              .fn()
              .mockResolvedValue(FAKE_COUNTRIES),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

    it('should return exactly 3 recommendations', async () => {
    const results = await service.recommendCountries(FAKE_PREFERENCES);
    expect(results).toHaveLength(3);
  });
 
  it('should return results sorted by totalScore descending', async () => {
    const results = await service.recommendCountries(FAKE_PREFERENCES);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].totalScore).toBeGreaterThanOrEqual(results[i + 1].totalScore);
    }
  });
 
  it('should include breakdown with expected criteria', async () => {
    const results = await service.recommendCountries(FAKE_PREFERENCES);
    const first = results[0];
    expect(first.breakdown).toHaveProperty('budget');
    expect(first.breakdown).toHaveProperty('climate');
    expect(first.breakdown).toHaveProperty('travelMonth');
    expect(first.breakdown).toHaveProperty('nature');
    expect(first.breakdown).toHaveProperty('sport');
  });
});
