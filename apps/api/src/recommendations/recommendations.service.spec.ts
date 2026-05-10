import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const mockPrisma = {
    country: { findMany: jest.fn() },
    savedRecommendation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
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

  describe('saveRecommendations', () => {
    it('should create a saved recommendation with userId', async () => {
      const dto = {
        name: 'Mon voyage',
        criteriaSnapshot: { budget: 3 },
        resultsSnapshot: [{ rank: 1, score: 90 }],
      };
      const mockSaved = { id: 'reco-1', userId: 'user-1', ...dto };
      mockPrisma.savedRecommendation.create.mockResolvedValue(mockSaved);

      const result = await service.saveRecommendations('user-1', dto);

      expect(result).toEqual(mockSaved);
      expect(mockPrisma.savedRecommendation.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: dto.name,
          criteriaSnapshot: dto.criteriaSnapshot,
          resultsSnapshot: dto.resultsSnapshot,
        },
      });
    });
  });

  describe('getSavedRecommendations', () => {
    it('should return saved recommendations for a user', async () => {
      const mockList = [{ id: 'reco-1', userId: 'user-1' }];
      mockPrisma.savedRecommendation.findMany.mockResolvedValue(mockList);

      const result = await service.getSavedRecommendations('user-1');

      expect(result).toEqual(mockList);
      expect(mockPrisma.savedRecommendation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findSavedRecommendationById', () => {
    it('should return the recommendation if owner', async () => {
      const mockReco = { id: 'reco-1', userId: 'user-1' };
      mockPrisma.savedRecommendation.findUnique.mockResolvedValue(mockReco);

      const result = await service.findSavedRecommendationById(
        'reco-1',
        'user-1',
      );

      expect(result).toEqual(mockReco);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.savedRecommendation.findUnique.mockResolvedValue(null);

      await expect(
        service.findSavedRecommendationById('reco-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.savedRecommendation.findUnique.mockResolvedValue({
        id: 'reco-1',
        userId: 'other-user',
      });

      await expect(
        service.findSavedRecommendationById('reco-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeRecommendation', () => {
    it('should delete the recommendation if owner', async () => {
      const mockReco = { id: 'reco-1', userId: 'user-1' };
      mockPrisma.savedRecommendation.findUnique.mockResolvedValue(mockReco);
      mockPrisma.savedRecommendation.delete.mockResolvedValue(mockReco);

      const result = await service.removeRecommendation('reco-1', 'user-1');

      expect(result).toEqual(mockReco);
      expect(mockPrisma.savedRecommendation.delete).toHaveBeenCalledWith({
        where: { id: 'reco-1' },
      });
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.savedRecommendation.findUnique.mockResolvedValue({
        id: 'reco-1',
        userId: 'other-user',
      });

      await expect(
        service.removeRecommendation('reco-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
