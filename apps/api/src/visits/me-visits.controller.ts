import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisitsService } from './visits.service';

// e module users n'existe pas encore (sprint 5), donc ce controller vit dans visits.
@Controller('users/me/visits')
export class MeVisitsController {
  constructor(private readonly service: VisitsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyVisits(@Req() req: Request & { user: { id: string } }) {
    return this.service.findAllForUser(req.user.id);
  }
}
