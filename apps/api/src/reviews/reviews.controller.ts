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
import { UpsertReviewDto } from './dto/upsert-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async upsert(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpsertReviewDto,
  ) {
    return this.service.upsert(req.user.id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.remove(id, req.user.id);
  }

  @Get('country/:isoCode')
  async getByCountry(@Param('isoCode') isoCode: string) {
    return this.service.findByCountry(isoCode);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Req() req: Request & { user: { id: string } }) {
    return this.service.findAllForUser(req.user.id);
  }
}
