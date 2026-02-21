import { TravelPreferences } from "../../src/recommendation/types/recommendation.types";
import { TravelType } from "../../src/recommendation/types/recommendation.types";

// Préférences utilisateur de test
const FAKE_PREFERENCES: TravelPreferences = {
  budget: 3,
  safety: 4,
  travelTypes: [TravelType.Nature, TravelType.Sport],
  travelMonth: 7,
  climate: 4,
  withChildren: false,
  touristPopularity: 3,
};

export default FAKE_PREFERENCES;