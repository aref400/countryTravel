import { PrismaClient } from "../../generated/prisma/client";
import { countriesProfiles } from "../data/countries-profiles";

export async function seedProfiles(prisma: PrismaClient) {
    
    for(const profile of countriesProfiles){
        await prisma.countryScoreProfile.upsert({
            where: { countryId: profile.isoCode },
            create: {
                countryId: profile.isoCode,
                priceLevel: profile.priceLevel,
                safetyLevel: profile.safetyLevel,
                tourismCrowdLevel: profile.tourismCrowdLevel,
                familyFriendlinessLevel: profile.familyFriendlinessLevel,
                partyLevel: profile.partyLevel,
                sportLevel: profile.sportLevel,
                natureLevel: profile.natureLevel,
                cultureLevel: profile.cultureLevel,
                climateLevel: profile.climateLevel,
                bestMonthsFrom: profile.bestMonthsFrom,
                bestMonthsTo: profile.bestMonthsTo
            },
            update: {
                priceLevel: profile.priceLevel,
                safetyLevel: profile.safetyLevel,
                tourismCrowdLevel: profile.tourismCrowdLevel,
                familyFriendlinessLevel: profile.familyFriendlinessLevel,
                partyLevel: profile.partyLevel,
                sportLevel: profile.sportLevel,
                natureLevel: profile.natureLevel,
                cultureLevel: profile.cultureLevel,
                climateLevel: profile.climateLevel,
                bestMonthsFrom: profile.bestMonthsFrom,
                bestMonthsTo: profile.bestMonthsTo
            }
        });
    }
}