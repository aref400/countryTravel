import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getAllCountries(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('continent') continent?: string,
    @Query('currency') currency?: string,
    @Query('search') search?: string,
  ) {
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

  @Get(':isoCode')
  async getCountry(@Param('isoCode') isoCode: string) {
    return this.countriesService.findByIsoCode(isoCode);
  }
}
