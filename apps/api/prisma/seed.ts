import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { Continent, PrismaClient } from '../src/generated/prisma/client';
import decriptionPays from './data/descriptions.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SELECTED_ISO = [
  'FR',
  'ES',
  'US',
  'CN',
  'IT',
  'TR',
  'MX',
  'TH',
  'DE',
  'GB',
  'JP',
  'AT',
  'GR',
  'MY',
  'PT',
  'CA',
  'BR',
  'NL',
  'AU',
  'MA',
  'IN',
  'CH',
  'KR',
  'HR',
  'ID',
  'AR',
  'EG',
  'VN',
  'CZ',
  'PE',
];

const continentMap: Record<string, Continent> = {
  Europe: Continent.europe,
  Asia: Continent.asia,
  Americas: Continent.americas,
  Africa: Continent.africa,
  Oceania: Continent.oceania,
  Antarctic: Continent.poles,
};

interface RestCountry {
  cca2: string;
  name: { common: string };
  region: string;
  capital?: string[];
  flags?: { svg: string };
}

export async function seedCountries(client: PrismaClient = prisma) {
  //fetch api Rest Countries
  const response = await fetch(
    'https://restcountries.com/v3.1/all?fields=cca2,name,region,capital,flags',
  );
  const all = (await response.json()) as RestCountry[];

  const countries = all.filter((c) => SELECTED_ISO.includes(c.cca2));

  for (const country of countries) {
    const descriptions = decriptionPays.find((d) => d.isoCode === country.cca2);
    await client.country.upsert({
      where: { isoCode: country.cca2 },
      update: {
        continent: continentMap[country.region] ?? Continent.europe,
        description: descriptions?.description ?? null,
      },
      create: {
        isoCode: country.cca2,
        name: country.name.common,
        continent: continentMap[country.region] ?? Continent.europe,
        description: descriptions?.description ?? null,
        capital: country.capital?.[0] ?? null,
        flagUrl: country.flags?.svg ?? null,
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
