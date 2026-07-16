import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertReviewDto } from './dto/upsert-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, dto: UpsertReviewDto) {
    const country = await this.prisma.country.findUnique({
      where: { id: dto.countryId },
    });
    if (!country?.isPublished) {
      throw new NotFoundException('Country not found');
    }

    const visit = await this.prisma.visit.findUnique({
      where: { userId_countryId: { userId, countryId: dto.countryId } },
    });
    if (!visit) {
      throw new UnprocessableEntityException(
        'You must have visited this country to review it',
      );
    }

    return this.prisma.review.upsert({
      where: { userId_countryId: { userId, countryId: dto.countryId } },
      update: { rating: dto.rating, content: dto.content ?? null },
      create: {
        userId,
        countryId: dto.countryId,
        rating: dto.rating,
        content: dto.content ?? null,
      },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }
    return this.prisma.review.delete({ where: { id } });
  }

  async findByCountry(isoCode: string) {
    const country = await this.prisma.country.findUnique({
      where: { isoCode, isPublished: true },
    });
    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return this.prisma.review.findMany({
      where: { countryId: country.id, isVisible: true },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        country: {
          select: { id: true, isoCode: true, name: true, flagUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
