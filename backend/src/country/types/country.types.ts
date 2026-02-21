export interface CountrywithProfile {
    isoCode: string ;
    name: string;
    flagUrl: string | null;
    region: string | null;
    countryScoreProfiles: {
        countryId: string | null;
        priceLevel: number | null;
        safetyLevel: number | null;
        tourismCrowdLevel: number | null;
        familyFriendlinessLevel: number | null;
        partyLevel: number | null;
        sportLevel: number | null;
        natureLevel: number | null;
        cultureLevel: number | null;
        historyLevel: number | null;
        adventureLevel: number | null;
        luxuryLevel: number | null;
        climateLevel: number | null;
        bestMonthsFrom: number | null;
        bestMonthsTo: number | null;
    } | null;
}