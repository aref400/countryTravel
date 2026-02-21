import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';

@Injectable()
export class CountryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllWithProfiles() {
    return this.prisma.client.country.findMany({
      include: {
        countryScoreProfiles: true,
      },
    });
  }
}
