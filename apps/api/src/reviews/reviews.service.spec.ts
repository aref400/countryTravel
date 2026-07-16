import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockPrisma = {
    country: { findUnique: jest.fn() },
    visit: { findUnique: jest.fn() },
    review: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCountry = {
    id: 'country-1',
    isoCode: 'FR',
    name: 'France',
    isPublished: true,
  };

  const baseDto = { countryId: 'country-1', rating: 4, content: 'Super !' };

  describe('upsert', () => {
    it('should create/update the review if country visited', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue({ id: 'visit-1' });
      const mockReview = { id: 'review-1', userId: 'user-1', ...baseDto };
      mockPrisma.review.upsert.mockResolvedValue(mockReview);

      const result = await service.upsert('user-1', baseDto);

      expect(result).toEqual(mockReview);
      expect(mockPrisma.review.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_countryId: { userId: 'user-1', countryId: 'country-1' },
          },
          update: { rating: 4, content: 'Super !' },
          create: {
            userId: 'user-1',
            countryId: 'country-1',
            rating: 4,
            content: 'Super !',
          },
        }),
      );
    });

    it('should throw NotFoundException if country does not exist', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      await expect(service.upsert('user-1', baseDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.review.upsert).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if country not visited', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue(null);

      await expect(service.upsert('user-1', baseDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockPrisma.review.upsert).not.toHaveBeenCalled();
    });

    it('should store null content when not provided', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue({ id: 'visit-1' });
      mockPrisma.review.upsert.mockResolvedValue({ id: 'review-1' });

      await service.upsert('user-1', { countryId: 'country-1', rating: 5 });

      expect(mockPrisma.review.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { rating: 5, content: null },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete the review if owner', async () => {
      const mockReview = { id: 'review-1', userId: 'user-1' };
      mockPrisma.review.findUnique.mockResolvedValue(mockReview);
      mockPrisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove('review-1', 'user-1');

      expect(result).toEqual(mockReview);
      expect(mockPrisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
    });

    it('should throw NotFoundException if review does not exist', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(service.remove('review-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'other-user',
      });

      await expect(service.remove('review-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.review.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByCountry', () => {
    it('should return visible reviews of the country', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      const mockReviews = [{ id: 'review-1', user: { username: 'testuser' } }];
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByCountry('FR');

      expect(result).toEqual(mockReviews);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { countryId: 'country-1', isVisible: true },
        }),
      );
    });

    it('should throw NotFoundException if country does not exist', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      await expect(service.findByCountry('ZZ')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllForUser', () => {
    it('should return reviews of the user with country info', async () => {
      const mockReviews = [{ id: 'review-1', country: { isoCode: 'FR' } }];
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findAllForUser('user-1');

      expect(result).toEqual(mockReviews);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });
});
