import { Test, TestingModule } from '@nestjs/testing';
import { CountryCriteria } from '../generated/prisma/client';
import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;

  // ScoringService ne dépend d'aucun autre service — pas besoin de mock
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  // Helper pour construire des critères sans répéter tous les champs
  const makeCriteria = (overrides: Partial<CountryCriteria>): CountryCriteria =>
    ({
      id: 'crit-1',
      countryId: 'country-1',
      budget: 3,
      safety: 3,
      temperature: 3,
      familyFriendly: false,
      natureLevel: 3,
      partyLevel: 3,
      sportLevel: 3,
      cultureLevel: 3,
      historyLevel: 3,
      gastronomyLevel: 3,
      cityLevel: 3,
      relaxationLevel: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as CountryCriteria;

  const baseForm = {
    budget: 3,
    safety: 3,
    temperature: 3,
    familyFriendly: false,
    natureLevel: 3,
    partyLevel: 3,
    sportLevel: 3,
    cultureLevel: 3,
    historyLevel: 3,
    gastronomyLevel: 3,
    cityLevel: 3,
    relaxationLevel: 3,
  };

  describe('calculateScore — filtres éliminatoires', () => {
    it('should return 0 if safety is too low', () => {
      const result = service.calculateScore(makeCriteria({ safety: 2 }), {
        ...baseForm,
        safety: 3,
      });
      expect(result).toBe(0);
    });

    it('should return 0 if budget is too high', () => {
      const result = service.calculateScore(makeCriteria({ budget: 5 }), {
        ...baseForm,
        budget: 3,
      });
      expect(result).toBe(0);
    });

    it('should return 0 if familyFriendly required but country is not', () => {
      const result = service.calculateScore(
        makeCriteria({ familyFriendly: false }),
        { ...baseForm, familyFriendly: true },
      );
      expect(result).toBe(0);
    });

    it('should NOT eliminate if familyFriendly not required', () => {
      const result = service.calculateScore(
        makeCriteria({ familyFriendly: false }),
        { ...baseForm, familyFriendly: false },
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should NOT eliminate if safety exactly meets requirement', () => {
      const result = service.calculateScore(makeCriteria({ safety: 3 }), {
        ...baseForm,
        safety: 3,
      });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateScore — score pondéré', () => {
    it('should return 100 if all activity levels match perfectly', () => {
      // Tous les écarts = 0 → score = 100
      const result = service.calculateScore(makeCriteria({}), baseForm);
      expect(result).toBe(100);
    });

    it('should return 50 if all activity levels are max distance apart', () => {
      // Pays a tout à 1, form veut tout à 5 → distance = 4 → score = 0 par activité
      // mais 1 - 4/4 = 0 → avg = 0 → 0 * 100 = 0
      const result = service.calculateScore(
        makeCriteria({
          natureLevel: 1,
          partyLevel: 1,
          sportLevel: 1,
          cultureLevel: 1,
          historyLevel: 1,
          gastronomyLevel: 1,
          cityLevel: 1,
          relaxationLevel: 1,
        }),
        {
          ...baseForm,
          natureLevel: 5,
          partyLevel: 5,
          sportLevel: 5,
          cultureLevel: 5,
          historyLevel: 5,
          gastronomyLevel: 5,
          cityLevel: 5,
          relaxationLevel: 5,
        },
      );
      expect(result).toBe(0);
    });

    it('should return 75 if all activity levels are half distance apart', () => {
      // distance = 2 → 1 - 2/4 = 0.5 → mais on veut tester distance = 1 → 1 - 1/4 = 0.75
      const result = service.calculateScore(
        makeCriteria({
          natureLevel: 4,
          partyLevel: 4,
          sportLevel: 4,
          cultureLevel: 4,
          historyLevel: 4,
          gastronomyLevel: 4,
          cityLevel: 4,
          relaxationLevel: 4,
        }),
        {
          ...baseForm,
          natureLevel: 5,
          partyLevel: 5,
          sportLevel: 5,
          cultureLevel: 5,
          historyLevel: 5,
          gastronomyLevel: 5,
          cityLevel: 5,
          relaxationLevel: 5,
        },
      );
      expect(result).toBe(75);
    });

    it('should return an integer between 0 and 100', () => {
      const result = service.calculateScore(
        makeCriteria({ natureLevel: 2, cultureLevel: 5 }),
        { ...baseForm, natureLevel: 4, cultureLevel: 1 },
      );
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should accept family friendly country when required', () => {
      const result = service.calculateScore(
        makeCriteria({ familyFriendly: true }),
        { ...baseForm, familyFriendly: true },
      );
      expect(result).toBeGreaterThan(0);
    });
  });
});
