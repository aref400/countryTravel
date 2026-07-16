import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { MeVisitsController } from './me-visits.controller';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

type AuthRequest = Request & { user: { id: string } };

describe('VisitsController', () => {
  let controller: VisitsController;
  let meController: MeVisitsController;

  // Dans les tests de controller, on mock le Service (pas Prisma directement)
  const mockVisitsService = {
    create: jest.fn(),
    remove: jest.fn(),
    findAllForUser: jest.fn(),
    findMapByUsername: jest.fn(),
  };

  const mockReq = { user: { id: 'user-1' } } as AuthRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController, MeVisitsController],
      providers: [{ provide: VisitsService, useValue: mockVisitsService }],
    }).compile();

    controller = module.get<VisitsController>(VisitsController);
    meController = module.get<MeVisitsController>(MeVisitsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(meController).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with userId and dto', async () => {
      const dto = { countryId: 'country-1' };
      const mockVisit = { id: 'visit-1', ...dto };
      mockVisitsService.create.mockResolvedValue(mockVisit);

      const result = await controller.create(mockReq, dto);

      expect(result).toEqual(mockVisit);
      expect(mockVisitsService.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with userId and countryId', async () => {
      const mockVisit = { id: 'visit-1' };
      mockVisitsService.remove.mockResolvedValue(mockVisit);

      const result = await controller.remove(mockReq, 'country-1');

      expect(result).toEqual(mockVisit);
      expect(mockVisitsService.remove).toHaveBeenCalledWith(
        'user-1',
        'country-1',
      );
    });
  });

  describe('getMapByUsername', () => {
    it('should call service.findMapByUsername', async () => {
      const mockMap = [{ isoCode: 'FR', name: 'France' }];
      mockVisitsService.findMapByUsername.mockResolvedValue(mockMap);

      const result = await controller.getMapByUsername('testuser');

      expect(result).toEqual(mockMap);
      expect(mockVisitsService.findMapByUsername).toHaveBeenCalledWith(
        'testuser',
      );
    });
  });

  describe('getMyVisits', () => {
    it('should call service.findAllForUser with the connected user id', async () => {
      const mockVisits = [{ id: 'visit-1' }];
      mockVisitsService.findAllForUser.mockResolvedValue(mockVisits);

      const result = await meController.getMyVisits(mockReq);

      expect(result).toEqual(mockVisits);
      expect(mockVisitsService.findAllForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
