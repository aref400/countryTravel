import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient} from '@prisma/client';
import { seedCountries } from './seeders/countries.seeder';
import { seedProfiles } from './seeders/profiles.seeder';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {

  await seedCountries(prisma);
  await seedProfiles(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // toujours fermer la connexion
  });
