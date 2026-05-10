import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  const mockRecommendationsService = {
    getRecommendations: jest.fn(),
    saveRecommendations: jest.fn(),
    getSavedRecommendations: jest.fn(),
    findSavedRecommendationById: jest.fn(),
    removeRecommendation: jest.fn(),
  };

  const mockReq = (id: string) => ({ user: { id } }) as any;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: mockRecommendationsService,
        },
      ],
    }).compile();

    controller = module.get<RecommendationsController>(
      RecommendationsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('compute', () => {
    it('should call getRecommendations with form and return results', async () => {
      const mockResult = [
        {
          rank: 1,
          score: 90,
          country: {
            isoCode: 'JP',
            name: 'Japan',
            flagUrl: null,
            continent: null,
            description: null,
          },
        },
        {
          rank: 2,
          score: 75,
          country: {
            isoCode: 'FR',
            name: 'France',
            flagUrl: null,
            continent: null,
            description: null,
          },
        },
      ];
      mockRecommendationsService.getRecommendations.mockResolvedValue(
        mockResult,
      );

      const result = await controller.computeRecommendations(baseForm);

      expect(result).toEqual(mockResult);
      expect(
        mockRecommendationsService.getRecommendations,
      ).toHaveBeenCalledWith(baseForm);
    });

    it('should return empty array if no country matches', async () => {
      mockRecommendationsService.getRecommendations.mockResolvedValue([]);

      const result = await controller.computeRecommendations(baseForm);

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should call saveRecommendations with userId and dto', async () => {
      const dto = {
        name: 'Mon voyage',
        criteriaSnapshot: {},
        resultsSnapshot: [],
      };
      const mockSaved = { id: 'reco-1', userId: 'user-1', ...dto };
      mockRecommendationsService.saveRecommendations.mockResolvedValue(
        mockSaved,
      );

      const result = await controller.save(mockReq('user-1'), dto as any);

      expect(result).toEqual(mockSaved);
      expect(
        mockRecommendationsService.saveRecommendations,
      ).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('getSaved', () => {
    it('should return saved recommendations for the user', async () => {
      const mockList = [{ id: 'reco-1' }];
      mockRecommendationsService.getSavedRecommendations.mockResolvedValue(
        mockList,
      );

      const result = await controller.getSaved(mockReq('user-1'));

      expect(result).toEqual(mockList);
      expect(
        mockRecommendationsService.getSavedRecommendations,
      ).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getSavedById', () => {
    it('should return a saved recommendation by id', async () => {
      const mockReco = { id: 'reco-1', userId: 'user-1' };
      mockRecommendationsService.findSavedRecommendationById.mockResolvedValue(
        mockReco,
      );

      const result = await controller.getSavedById(mockReq('user-1'), 'reco-1');

      expect(result).toEqual(mockReco);
      expect(
        mockRecommendationsService.findSavedRecommendationById,
      ).toHaveBeenCalledWith('reco-1', 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a saved recommendation', async () => {
      const mockReco = { id: 'reco-1', userId: 'user-1' };
      mockRecommendationsService.removeRecommendation.mockResolvedValue(
        mockReco,
      );

      const result = await controller.remove(mockReq('user-1'), 'reco-1');

      expect(result).toEqual(mockReco);
      expect(
        mockRecommendationsService.removeRecommendation,
      ).toHaveBeenCalledWith('reco-1', 'user-1');
    });
  });
});
