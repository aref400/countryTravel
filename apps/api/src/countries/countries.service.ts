import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.country.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.country.count({ where: { isPublished: true } }),
    ]);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async findByIsoCode(isoCode: string) {
    const country = await this.prisma.country.findUnique({
      where: { isoCode, isPublished: true },
      include: { criteria: true },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    const stats = await this.prisma.review.aggregate({
      where: { countryId: country.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      ...country,
      avgRating: stats._avg.rating,
      nbReviews: stats._count.id,
    };
  }

  async findMapData() {
    const countriesMap = await this.prisma.country.findMany({
      where: { isPublished: true },
      select: {
        isoCode: true,
        name: true,
        flagUrl: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    return countriesMap.map((country) => {
      const ratings = country.reviews.map((r) => r.rating);
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

      return {
        isoCode: country.isoCode,
        name: country.name,
        flagUrl: country.flagUrl,
        avgRating,
      };
    });
  }
}
