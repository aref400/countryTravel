import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

type AuthRequest = Request & { user: { id: string } };

describe('ReviewsController', () => {
  let controller: ReviewsController;

  // Dans les tests de controller, on mock le Service (pas Prisma directement)
  const mockReviewsService = {
    upsert: jest.fn(),
    remove: jest.fn(),
    findByCountry: jest.fn(),
    findAllForUser: jest.fn(),
  };

  const mockReq = { user: { id: 'user-1' } } as AuthRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockReviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upsert', () => {
    it('should call service.upsert with userId and dto', async () => {
      const dto = { countryId: 'country-1', rating: 4, content: 'Top' };
      const mockReview = { id: 'review-1', ...dto };
      mockReviewsService.upsert.mockResolvedValue(mockReview);

      const result = await controller.upsert(mockReq, dto);

      expect(result).toEqual(mockReview);
      expect(mockReviewsService.upsert).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with review id and userId', async () => {
      const mockReview = { id: 'review-1' };
      mockReviewsService.remove.mockResolvedValue(mockReview);

      const result = await controller.remove(mockReq, 'review-1');

      expect(result).toEqual(mockReview);
      expect(mockReviewsService.remove).toHaveBeenCalledWith(
        'review-1',
        'user-1',
      );
    });
  });

  describe('getByCountry', () => {
    it('should call service.findByCountry with isoCode', async () => {
      const mockReviews = [{ id: 'review-1' }];
      mockReviewsService.findByCountry.mockResolvedValue(mockReviews);

      const result = await controller.getByCountry('FR');

      expect(result).toEqual(mockReviews);
      expect(mockReviewsService.findByCountry).toHaveBeenCalledWith('FR');
    });
  });

  describe('getMyReviews', () => {
    it('should call service.findAllForUser with the connected user id', async () => {
      const mockReviews = [{ id: 'review-1' }];
      mockReviewsService.findAllForUser.mockResolvedValue(mockReviews);

      const result = await controller.getMyReviews(mockReq);

      expect(result).toEqual(mockReviews);
      expect(mockReviewsService.findAllForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
