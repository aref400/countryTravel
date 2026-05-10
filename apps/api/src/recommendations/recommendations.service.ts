import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecoFormDto } from '../scoring/dto/reco-form.dto';
import { ScoringService } from '../scoring/scoring.service';
import { SaveRecoDto } from './dto/save-recommendations.dto';

export interface RecoResult {
  rank: number;
  score: number;
  country: {
    isoCode: string;
    name: string;
    flagUrl: string | null;
    continent: string | null;
    description: string | null;
  };
}

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
  ) {}

  async getRecommendations(
    form: RecoFormDto,
    topN: number = 5,
  ): Promise<RecoResult[]> {
    const countries = await this.prisma.country.findMany({
      where: { isPublished: true, criteria: { isNot: null } },
      include: { criteria: true },
    });
    return countries
      .map((country) => ({
        score: this.scoring.calculateScore(country.criteria!, form),
        country: {
          isoCode: country.isoCode,
          name: country.name,
          flagUrl: country.flagUrl,
          continent: country.continent,
          description: country.description,
        },
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((item, index) => ({ rank: index + 1, ...item }));
    // Retourne les pays les plus adapté en recupérant les calculs du score
    //  et en filtrant le resultat pour garder seulement le Top 5
  }

  async saveRecommendations(userId: string, dto: SaveRecoDto) {
    return this.prisma.savedRecommendation.create({
      data: {
        userId,
        name: dto.name,
        criteriaSnapshot: dto.criteriaSnapshot,
        resultsSnapshot: dto.resultsSnapshot,
      },
    });
  }

  async getSavedRecommendations(userId: string) {
    return this.prisma.savedRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findSavedRecommendationById(id: string, userId: string) {
    const savedReco = await this.prisma.savedRecommendation.findUnique({
      where: { id },
    });
    if (!savedReco) {
      throw new NotFoundException('Recommendation not found');
    }
    if (savedReco.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to access this recommendation',
      );
    }
    return savedReco;
  }

  async removeRecommendation(id: string, userId: string) {
    await this.findSavedRecommendationById(id, userId);
    return this.prisma.savedRecommendation.delete({
      where: { id },
    });
  }
}
