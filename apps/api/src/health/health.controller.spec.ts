import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockDatabaseHealthIndicator = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        {
          provide: DatabaseHealthIndicator,
          useValue: mockDatabaseHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check (readiness)', () => {
    it('délègue à HealthCheckService.check avec la sonde base', async () => {
      const expected = { status: 'ok', info: { database: { status: 'up' } } };
      mockHealthCheckService.check.mockResolvedValue(expected);

      const result = await controller.check();

      expect(mockHealthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(expected);
    });
  });

  describe('liveness', () => {
    it('renvoie un statut ok avec uptime et timestamp', () => {
      const result = controller.liveness();

      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
