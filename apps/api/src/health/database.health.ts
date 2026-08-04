import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Sonde de readiness : vérifie que l'API peut réellement joindre la base
 * PostgreSQL. On exécute un `SELECT 1` (requête triviale, sans effet de bord)
 * et on mesure le temps de réponse, qui devient un indicateur de suivi
 * exploitable pour définir un seuil d'alerte.
 */
@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return indicator.up({ responseTime });
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }
}
