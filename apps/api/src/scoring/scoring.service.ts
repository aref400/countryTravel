import { Injectable } from '@nestjs/common';
import { CountryCriteria } from '../generated/prisma/client';
import { RecoFormDto } from './dto/reco-form.dto';

@Injectable()
export class ScoringService {
  private readonly MAX_DISTANCE = 4; // écart max entre 1 et 5

  calculateScore(criteria: CountryCriteria, form: RecoFormDto): number {
    // Étape 1 : filtres éliminatoires
    // si safety du pays < safety demandé → return 0
    // si budget du pays > budget demandé → return 0
    // si familyFriendly demandé mais pays non family-friendly → return 0
    // Étape 2 : score pondéré pour les 8 activités
    // pour chaque activité : score = 1 - (distance / MAX_DISTANCE)
    // moyenne de tous les scores → multiplier par 100
    if (criteria.safety < form.safety) {
      return 0;
    }
    if (criteria.budget > form.budget) {
      return 0;
    }
    if (form.familyFriendly && !criteria.familyFriendly) {
      return 0;
    }
    const scores = [
      1 - Math.abs(criteria.natureLevel - form.natureLevel) / this.MAX_DISTANCE,
      1 - Math.abs(criteria.partyLevel - form.partyLevel) / this.MAX_DISTANCE,
      1 - Math.abs(criteria.sportLevel - form.sportLevel) / this.MAX_DISTANCE,
      1 -
        Math.abs(criteria.cultureLevel - form.cultureLevel) / this.MAX_DISTANCE,
      1 -
        Math.abs(criteria.historyLevel - form.historyLevel) / this.MAX_DISTANCE,
      1 -
        Math.abs(criteria.gastronomyLevel - form.gastronomyLevel) /
          this.MAX_DISTANCE,
      1 - Math.abs(criteria.cityLevel - form.cityLevel) / this.MAX_DISTANCE,
      1 -
        Math.abs(criteria.relaxationLevel - form.relaxationLevel) /
          this.MAX_DISTANCE,
    ];

    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg * 100);
  }
}
