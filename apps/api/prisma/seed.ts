import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { Continent, PrismaClient } from '../src/generated/prisma/client';
import countriesData from './data/countries.json';
import decriptionPays from './data/descriptions.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Les données pays sont embarquées dans le repo (prisma/data/countries.json,
// snapshot de l'API Rest Countries) plutôt que récupérées par le réseau au
// moment du seed : l'API restcountries.com v3.1 a été dépréciée et coupée,
// et un seed reproductible ne doit pas dépendre d'un service externe.
interface CountrySeed {
  isoCode: string;
  name: string;
  continent: string;
  capital: string | null;
  flagUrl: string | null;
  currency: string | null;
}

export async function seedCountries(client: PrismaClient = prisma) {
  const countries = countriesData as CountrySeed[];

  for (const country of countries) {
    const descriptions = decriptionPays.find(
      (d) => d.isoCode === country.isoCode,
    );

    await client.country.upsert({
      where: { isoCode: country.isoCode },
      update: {
        continent: country.continent as Continent,
        description: descriptions?.description ?? null,
        currency: country.currency,
      },
      create: {
        isoCode: country.isoCode,
        name: country.name,
        continent: country.continent as Continent,
        description: descriptions?.description ?? null,
        capital: country.capital,
        flagUrl: country.flagUrl,
        currency: country.currency,
      },
    });
  }

  console.log(`✅ ${countries.length} pays insérés`);
}

if (require.main === module) {
  seedCountries()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
