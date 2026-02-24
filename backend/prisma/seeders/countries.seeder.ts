import { PrismaClient } from '@prisma/client';

export async function seedCountries(prisma: PrismaClient) {
  //fetch api Rest Countries
  const response = await fetch(
    'https://restcountries.com/v3.1/all?fields=cca2,name,region,flags',
  );
  const countries = await response.json();

  const TARGET_ISO_CODES: string[] = [
    'FR', // France
    'IE', // Irlande
    'AT', // Autriche
    'HU', // Hongrie
    'HR', // Croatie
    'ES', // Espagne
    'NO', // Norvège
    'SE', // Suède
    'JP', // Japon
    'CN', // Chine
    'KR', // Corée du Sud
    'TH', // Thailande
    'NP', // Népal
    'PA', // Panama
    'CO', // Colombie
    'BR', // Brésil
    'AR', // Argentine
    'BO', // Bolivie
    'TN', // Tunisie
    'MA', // Maroc
  ];
  const filteredCountries = countries.filter((country: any) =>
    TARGET_ISO_CODES.includes(country.cca2),
  );

  for (const country of filteredCountries) {
    await prisma.country.upsert({
      where: { isoCode: country.cca2 },
      create: {
        isoCode: country.cca2,
        name: country.name.common,
        region: country.region,
        flagUrl: country.flags.png,
      },
      update: {
        name: country.name.common,
        region: country.region,
        flagUrl: country.flags.png,
      },
    });
  }
}
