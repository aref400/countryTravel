import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CountriesService } from './countries.service';

describe('CountriesService', () => {
  let service: CountriesService;

  // On remplace PrismaService par un faux objet qui simule ses méthodes
  const mockPrismaService = {
    country: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    review: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated countries with meta', async () => {
      // Arrange — on dit au mock ce qu'il doit retourner
      const mockCountries = [
        { id: '1', name: 'France', isoCode: 'FR', isPublished: true },
        { id: '2', name: 'Spain', isoCode: 'ES', isPublished: true },
      ];
      mockPrismaService.country.findMany.mockResolvedValue(mockCountries);
      mockPrismaService.country.count.mockResolvedValue(30);

      // Act
      const result = await service.findAll(1, 2);

      // Assert
      expect(result).toEqual({
        data: mockCountries,
        meta: { page: 1, limit: 2, total: 30 },
      });
      // findMany et count sont appelés en parallèle (Promise.all)
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 2 }),
      );
    });

    it('should calculate skip correctly for page 2', async () => {
      mockPrismaService.country.findMany.mockResolvedValue([]);
      mockPrismaService.country.count.mockResolvedValue(0);

      await service.findAll(2, 10);

      // Page 2 avec limit 10 → skip = 10
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findByIsoCode', () => {
    it('should return country with avgRating and nbReviews', async () => {
      // Arrange
      const mockCountry = {
        id: 'country-id',
        name: 'France',
        isoCode: 'FR',
        criteria: null,
      };
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { id: 12 },
      });

      // Act
      const result = await service.findByIsoCode('FR');

      // Assert — le spread operator enrichit l'objet country
      expect(result).toEqual({
        ...mockCountry,
        avgRating: 4.5,
        nbReviews: 12,
      });
    });

    it('should throw NotFoundException if country does not exist', async () => {
      // Arrange — le pays n'existe pas en DB
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByIsoCode('ZZ')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return null avgRating if no reviews', async () => {
      const mockCountry = {
        id: 'country-id',
        name: 'France',
        isoCode: 'FR',
        criteria: null,
      };
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { id: 0 },
      });

      const result = await service.findByIsoCode('FR');

      expect(result.avgRating).toBeNull();
      expect(result.nbReviews).toBe(0);
    });
  });

  describe('findRandom', () => {
    it('should return a random country', async () => {
      mockPrismaService.country.findMany.mockResolvedValueOnce([
        { isoCode: 'FR' },
        { isoCode: 'JP' },
      ]);
      const mockCountry = {
        id: '1',
        name: 'France',
        isoCode: 'FR',
        criteria: null,
      };
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { id: 0 },
      });

      const result = await service.findRandom();

      expect(['FR', 'JP']).toContain(result.isoCode);
    });
  });

  describe('findMapData', () => {
    it('should return countries with calculated avgRating', async () => {
      // Arrange — pays avec 2 reviews
      mockPrismaService.country.findMany.mockResolvedValue([
        {
          isoCode: 'FR',
          name: 'France',
          flagUrl: 'flag.svg',
          reviews: [{ rating: 4 }, { rating: 5 }],
        },
      ]);

      // Act
      const result = await service.findMapData();

      // Assert — avgRating calculé en JS : (4+5)/2 = 4.5
      expect(result).toEqual([
        { isoCode: 'FR', name: 'France', flagUrl: 'flag.svg', avgRating: 4.5 },
      ]);
    });

    it('should return null avgRating if no reviews', async () => {
      mockPrismaService.country.findMany.mockResolvedValue([
        { isoCode: 'JP', name: 'Japan', flagUrl: null, reviews: [] },
      ]);

      const result = await service.findMapData();

      expect(result[0].avgRating).toBeNull();
    });
  });
});
