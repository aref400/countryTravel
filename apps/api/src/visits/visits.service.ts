import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateVisitDto) {
    const country = await this.prisma.country.findUnique({
      where: { id: dto.countryId },
    });
    if (!country?.isPublished) {
      throw new NotFoundException('Country not found');
    }

    const existing = await this.prisma.visit.findUnique({
      where: { userId_countryId: { userId, countryId: dto.countryId } },
    });
    if (existing) {
      throw new ConflictException('Country already marked as visited');
    }

    return this.prisma.visit.create({
      data: {
        userId,
        countryId: dto.countryId,
        visitedAt: dto.visitedAt ? new Date(dto.visitedAt) : null,
      },
      include: {
        country: {
          select: { id: true, isoCode: true, name: true, flagUrl: true },
        },
      },
    });
  }

  async remove(userId: string, countryId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { userId_countryId: { userId, countryId } },
    });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    return this.prisma.visit.delete({ where: { id: visit.id } });
  }

  async findAllForUser(userId: string) {
    return this.prisma.visit.findMany({
      where: { userId },
      include: {
        country: {
          select: {
            id: true,
            isoCode: true,
            name: true,
            flagUrl: true,
            continent: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMapByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user?.isActive) {
      throw new NotFoundException('User not found');
    }

    const visits = await this.prisma.visit.findMany({
      where: { userId: user.id },
      select: {
        country: { select: { isoCode: true, name: true } },
      },
    });
    return visits.map((visit) => visit.country);
  }
}
