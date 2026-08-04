import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseHealthIndicator } from './database.health';

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;

  // On simule la session retournée par HealthIndicatorService.check(key) :
  // elle expose up()/down() qui produisent le rapport de la sonde.
  const up = jest.fn((data: Record<string, unknown>) => ({
    database: { status: 'up', ...data },
  }));
  const down = jest.fn((data: Record<string, unknown>) => ({
    database: { status: 'down', ...data },
  }));
  const mockHealthIndicatorService = {
    check: jest.fn(() => ({ up, down })),
  };

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: mockHealthIndicatorService,
        },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    indicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('renvoie "up" avec un temps de réponse quand la base répond', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await indicator.isHealthy('database');

    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(up).toHaveBeenCalledTimes(1);
    expect(typeof up.mock.calls[0][0].responseTime).toBe('number');
    expect(result.database.status).toBe('up');
  });

  it('renvoie "down" avec le message d\'erreur quand la base est injoignable', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    const result = await indicator.isHealthy('database');

    expect(down).toHaveBeenCalledWith({ message: 'connection refused' });
    expect(result.database.status).toBe('down');
  });
});
