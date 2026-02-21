import { Module } from '@nestjs/common';
import { CountryService } from './service/country.service';
import { CountryRepository } from './repository/country.repository';

@Module({
  providers: [CountryService, CountryRepository],
  exports: [CountryService],
})
export class CountryModule {}
