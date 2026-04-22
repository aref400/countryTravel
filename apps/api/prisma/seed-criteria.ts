import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';
import criteriaData from './data/criteria.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedCriteria(client: PrismaClient = prisma) {
  let count = 0;

  for (const entry of criteriaData) {
    const country = await client.country.findUnique({
      where: { isoCode: entry.isoCode },
    });

    if (!country) {
      console.warn(`⚠️  Pays introuvable : ${entry.isoCode} — ignoré`);
      continue;
    }

    await client.countryCriteria.upsert({
      where: { countryId: country.id },
      update: {
        budget: entry.budget,
        safety: entry.safety,
        temperature: entry.temperature,
        tourismLevel: entry.tourismLevel,
        familyFriendly: entry.familyFriendly,
        natureLevel: entry.natureLevel,
        partyLevel: entry.partyLevel,
        sportLevel: entry.sportLevel,
        cultureLevel: entry.cultureLevel,
        historyLevel: entry.historyLevel,
        gastronomyLevel: entry.gastronomyLevel,
        cityLevel: entry.cityLevel,
        relaxationLevel: entry.relaxationLevel,
      },
      create: {
        countryId: country.id,
        budget: entry.budget,
        safety: entry.safety,
        temperature: entry.temperature,
        tourismLevel: entry.tourismLevel,
        familyFriendly: entry.familyFriendly,
        natureLevel: entry.natureLevel,
        partyLevel: entry.partyLevel,
        sportLevel: entry.sportLevel,
        cultureLevel: entry.cultureLevel,
        historyLevel: entry.historyLevel,
        gastronomyLevel: entry.gastronomyLevel,
        cityLevel: entry.cityLevel,
        relaxationLevel: entry.relaxationLevel,
      },
    });

    count++;
  }

  console.log(`✅ ${count} critères insérés`);
}

if (require.main === module) {
  seedCriteria()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
