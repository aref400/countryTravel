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
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { RecoFormDto } from '../scoring/dto/reco-form.dto';
import { SaveRecoDto } from './dto/save-recommendations.dto';
import { RecommendationsService } from './recommendations.service';
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Post('compute')
  @UseGuards(OptionalJwtGuard)
  async computeRecommendations(@Body() form: RecoFormDto) {
    return this.service.getRecommendations(form);
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async save(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: SaveRecoDto,
  ) {
    return this.service.saveRecommendations(req.user.id, dto);
  }

  @Delete('saved/:id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.removeRecommendation(id, req.user.id);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  async getSaved(@Req() req: Request & { user: { id: string } }) {
    return this.service.getSavedRecommendations(req.user.id);
  }

  @Get('saved/:id')
  @UseGuards(JwtAuthGuard)
  async getSavedById(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.findSavedRecommendationById(id, req.user.id);
  }
}
