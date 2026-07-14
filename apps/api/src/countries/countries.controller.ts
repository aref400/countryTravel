import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountriesQueryDto } from './dto/countries-query.dto';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getAllCountries(@Query() query: CountriesQueryDto) {
    const { page, limit, continent, currency, search } = query;
    return this.countriesService.findAll(page, limit, {
      continent,
      currency,
      search,
    });
  }

  @Get('map/all')
  async getMapData() {
    return this.countriesService.findMapData();
  }

  @Get('random')
  async getRandomCountry() {
    return this.countriesService.findRandom();
  }

  @Get(':isoCode')
  async getCountry(@Param('isoCode') isoCode: string) {
    return this.countriesService.findByIsoCode(isoCode);
  }
}
