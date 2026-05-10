import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { RecoFormDto } from '../scoring/dto/reco-form.dto';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Post('compute')
  @UseGuards(OptionalJwtGuard)
  async computeRecommendations(@Body() form: RecoFormDto) {
    return this.service.getRecommendations(form);
  }
}
