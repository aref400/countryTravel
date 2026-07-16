import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly service: VisitsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateVisitDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  @Delete(':countryId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: Request & { user: { id: string } },
    @Param('countryId') countryId: string,
  ) {
    return this.service.remove(req.user.id, countryId);
  }

  @Get('map/:username')
  async getMapByUsername(@Param('username') username: string) {
    return this.service.findMapByUsername(username);
  }
}
