-- CreateTable
CREATE TABLE "Country" (
    "isoCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "flagUrl" TEXT,
    "description" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("isoCode")
);

-- CreateTable
CREATE TABLE "CountryScoreProfile" (
    "countryId" TEXT NOT NULL,
    "priceLevel" INTEGER,
    "safetyLevel" INTEGER,
    "tourismCrowdLevel" INTEGER,
    "familyFriendlinessLevel" INTEGER,
    "partyLevel" INTEGER,
    "sportLevel" INTEGER,
    "natureLevel" INTEGER,
    "cultureLevel" INTEGER,
    "historyLevel" INTEGER,
    "adventureLevel" INTEGER,
    "luxuryLevel" INTEGER,
    "climateLevel" INTEGER,
    "bestMonthsFrom" INTEGER,
    "bestMonthsTo" INTEGER,

    CONSTRAINT "CountryScoreProfile_pkey" PRIMARY KEY ("countryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryScoreProfile_countryId_key" ON "CountryScoreProfile"("countryId");

-- AddForeignKey
ALTER TABLE "CountryScoreProfile" ADD CONSTRAINT "CountryScoreProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("isoCode") ON DELETE RESTRICT ON UPDATE CASCADE;
