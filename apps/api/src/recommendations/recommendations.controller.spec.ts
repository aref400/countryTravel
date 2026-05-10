import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  const mockRecommendationsService = {
    getRecommendations: jest.fn(),
  };

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
});
