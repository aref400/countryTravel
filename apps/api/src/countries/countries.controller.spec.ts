import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';

describe('CountriesController', () => {
  let controller: CountriesController;

  // Dans les tests de controller, on mock le Service (pas Prisma directement)
  const mockCountriesService = {
    findAll: jest.fn(),
    findByIsoCode: jest.fn(),
    findMapData: jest.fn(),
    findRandom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        { provide: CountriesService, useValue: mockCountriesService },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCountries', () => {
    it('should call findAll with page and limit', async () => {
      const mockResult = { data: [], meta: { page: 1, limit: 20, total: 0 } };
      mockCountriesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.getAllCountries({ page: 1, limit: 20 });

      expect(result).toEqual(mockResult);
      expect(mockCountriesService.findAll).toHaveBeenCalledWith(1, 20, {
        continent: undefined,
        currency: undefined,
        search: undefined,
      });
    });
  });

  describe('getMapData', () => {
    it('should call findMapData and return results', async () => {
      const mockResult = [
        { isoCode: 'FR', name: 'France', flagUrl: null, avgRating: null },
      ];
      mockCountriesService.findMapData.mockResolvedValue(mockResult);

      const result = await controller.getMapData();

      expect(result).toEqual(mockResult);
      expect(mockCountriesService.findMapData).toHaveBeenCalled();
    });
  });

  describe('getCountry', () => {
    it('should call findByIsoCode with the isoCode param', async () => {
      const mockCountry = {
        id: '1',
        name: 'France',
        isoCode: 'FR',
        avgRating: 4.5,
        nbReviews: 10,
      };
      mockCountriesService.findByIsoCode.mockResolvedValue(mockCountry);

      const result = await controller.getCountry('FR');

      expect(result).toEqual(mockCountry);
      expect(mockCountriesService.findByIsoCode).toHaveBeenCalledWith('FR');
    });

    it('should propagate NotFoundException from service', async () => {
      mockCountriesService.findByIsoCode.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.getCountry('ZZ')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRandomCountry', () => {
    it('should call findRandom and return result', async () => {
      const mockCountry = {
        id: '1',
        name: 'France',
        isoCode: 'FR',
        avgRating: null,
        nbReviews: 0,
      };
      mockCountriesService.findRandom.mockResolvedValue(mockCountry);

      const result = await controller.getRandomCountry();

      expect(result).toEqual(mockCountry);
      expect(mockCountriesService.findRandom).toHaveBeenCalled();
    });
  });
});
