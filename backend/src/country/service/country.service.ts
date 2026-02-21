import { Injectable } from '@nestjs/common';
import { CountryRepository } from '../repository/country.repository';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  getAllCountriesWithProfiles() {
    return this.countryRepository.findAllWithProfiles();
  }
}
