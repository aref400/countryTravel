import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateVisitDto {
  @IsUUID()
  countryId!: string;

  @IsOptional()
  @IsDateString()
  visitedAt?: string;
}
