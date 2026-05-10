import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const mockPrisma = {
    country: { findMany: jest.fn() },
  };

  const mockScoring = {
    calculateScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ScoringService, useValue: mockScoring },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  const baseForm = {
    budget: 3,
    safety: 3,
    temperature: 3,
    familyFriendly: false,
    natureLevel: 3,
    partyLevel: 3,
    sportLevel: 3,
    cultureLevel: 3,
    historyLevel: 3,
    gastronomyLevel: 3,
    cityLevel: 3,
    relaxationLevel: 3,
  };

  const makeCountry = (isoCode: string, overrides = {}) => ({
    isoCode,
    name: `Country ${isoCode}`,
    flagUrl: null,
    continent: null,
    description: null,
    isPublished: true,
    criteria: { id: 'crit-1', countryId: isoCode },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should return countries sorted by score descending with correct rank', async () => {
      mockPrisma.country.findMany.mockResolvedValue([
        makeCountry('FR'),
        makeCountry('JP'),
        makeCountry('BR'),
      ]);
      mockScoring.calculateScore
        .mockReturnValueOnce(60) // FR
        .mockReturnValueOnce(90) // JP
        .mockReturnValueOnce(75); // BR

      const result = await service.getRecommendations(baseForm);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        rank: 1,
        score: 90,
        country: { isoCode: 'JP' },
      });
      expect(result[1]).toMatchObject({
        rank: 2,
        score: 75,
        country: { isoCode: 'BR' },
      });
      expect(result[2]).toMatchObject({
        rank: 3,
        score: 60,
        country: { isoCode: 'FR' },
      });
    });

    it('should filter out countries with score = 0', async () => {
      mockPrisma.country.findMany.mockResolvedValue([
        makeCountry('FR'),
        makeCountry('JP'),
      ]);
      mockScoring.calculateScore
        .mockReturnValueOnce(0) // FR éliminé
        .mockReturnValueOnce(80); // JP gardé

      const result = await service.getRecommendations(baseForm);

      expect(result).toHaveLength(1);
      expect(result[0].country.isoCode).toBe('JP');
    });

    it('should respect topN parameter', async () => {
      mockPrisma.country.findMany.mockResolvedValue([
        makeCountry('FR'),
        makeCountry('JP'),
        makeCountry('BR'),
        makeCountry('DE'),
      ]);
      mockScoring.calculateScore.mockReturnValue(50);

      const result = await service.getRecommendations(baseForm, 2);

      expect(result).toHaveLength(2);
    });

    it('should return empty array if no country passes filters', async () => {
      mockPrisma.country.findMany.mockResolvedValue([makeCountry('FR')]);
      mockScoring.calculateScore.mockReturnValue(0);

      const result = await service.getRecommendations(baseForm);

      expect(result).toHaveLength(0);
    });
  });
});
