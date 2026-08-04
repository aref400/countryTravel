import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';

/**
 * Endpoints de supervision.
 *
 * - `GET /api/v1/health`      : readiness — l'API est-elle capable de servir ?
 *   Agrège les sondes de dépendances (ici la base PostgreSQL). Renvoie 503 si
 *   une sonde est « down ». C'est la cible du moniteur d'uptime externe.
 * - `GET /api/v1/health/live` : liveness — le process répond-il ? Aucune
 *   dépendance testée : sert à distinguer « API tombée » de « dépendance KO ».
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.database.isHealthy('database')]);
  }

  @Get('live')
  liveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
