import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { VisitsService } from './visits.service';

describe('VisitsService', () => {
  let service: VisitsService;

  const mockPrisma = {
    country: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    visit: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
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

  describe('create', () => {
    it('should create a visit for an existing country', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue(null);
      const mockVisit = {
        id: 'visit-1',
        userId: 'user-1',
        countryId: 'country-1',
      };
      mockPrisma.visit.create.mockResolvedValue(mockVisit);

      const result = await service.create('user-1', {
        countryId: 'country-1',
      });

      expect(result).toEqual(mockVisit);
      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'user-1', countryId: 'country-1', visitedAt: null },
        }),
      );
    });

    it('should throw NotFoundException if country does not exist', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', { countryId: 'country-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.visit.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if country is unpublished', async () => {
      mockPrisma.country.findUnique.mockResolvedValue({
        ...mockCountry,
        isPublished: false,
      });

      await expect(
        service.create('user-1', { countryId: 'country-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if country already visited', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue({ id: 'visit-1' });

      await expect(
        service.create('user-1', { countryId: 'country-1' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.visit.create).not.toHaveBeenCalled();
    });

    it('should store visitedAt as Date when provided', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.visit.findUnique.mockResolvedValue(null);
      mockPrisma.visit.create.mockResolvedValue({ id: 'visit-1' });

      await service.create('user-1', {
        countryId: 'country-1',
        visitedAt: '2024-08-01',
      });

      expect(mockPrisma.visit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: 'user-1',
            countryId: 'country-1',
            visitedAt: new Date('2024-08-01'),
          },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete the visit if it exists', async () => {
      const mockVisit = { id: 'visit-1', userId: 'user-1' };
      mockPrisma.visit.findUnique.mockResolvedValue(mockVisit);
      mockPrisma.visit.delete.mockResolvedValue(mockVisit);

      const result = await service.remove('user-1', 'country-1');

      expect(result).toEqual(mockVisit);
      expect(mockPrisma.visit.delete).toHaveBeenCalledWith({
        where: { id: 'visit-1' },
      });
    });

    it('should throw NotFoundException if visit does not exist', async () => {
      mockPrisma.visit.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-1', 'country-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.visit.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('should return visits of the user with country info', async () => {
      const mockVisits = [{ id: 'visit-1', country: { isoCode: 'FR' } }];
      mockPrisma.visit.findMany.mockResolvedValue(mockVisits);

      const result = await service.findAllForUser('user-1');

      expect(result).toEqual(mockVisits);
      expect(mockPrisma.visit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('findMapByUsername', () => {
    it('should return the visited countries of the user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        username: 'testuser',
        isActive: true,
      });
      mockPrisma.visit.findMany.mockResolvedValue([
        { country: { isoCode: 'FR', name: 'France' } },
        { country: { isoCode: 'JP', name: 'Japan' } },
      ]);

      const result = await service.findMapByUsername('testuser');

      expect(result).toEqual([
        { isoCode: 'FR', name: 'France' },
        { isoCode: 'JP', name: 'Japan' },
      ]);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findMapByUsername('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });

      await expect(service.findMapByUsername('testuser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
