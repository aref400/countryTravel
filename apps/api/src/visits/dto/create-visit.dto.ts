import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateVisitDto {
  @IsUUID(undefined, { message: 'countryId doit être un UUID valide' })
  countryId!: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'visitedAt doit être une date valide (ex: 2024-08-01)' },
  )
  visitedAt?: string;
}
