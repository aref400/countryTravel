export class PrismaClient {
  $connect = jest.fn();
  $disconnect = jest.fn();
  country = { findMany: jest.fn(), upsert: jest.fn() };
  countryScoreProfile = { findMany: jest.fn(), upsert: jest.fn() };
}
