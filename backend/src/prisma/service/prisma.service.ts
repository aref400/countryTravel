import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit {
  readonly client: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    this.client = new PrismaClient({ adapter } as any);
  }

  async onModuleInit() {
    await this.client.$connect();
  }
}
