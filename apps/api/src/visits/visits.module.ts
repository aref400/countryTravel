import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MeVisitsController } from './me-visits.controller';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [PrismaModule],
  providers: [VisitsService],
  controllers: [VisitsController, MeVisitsController],
})
export class VisitsModule {}
