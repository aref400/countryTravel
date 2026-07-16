import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertReviewDto {
  @IsUUID(undefined, { message: 'countryId doit être un UUID valide' })
  countryId!: string;

  @IsInt({ message: 'La note doit être un nombre entier' })
  @Min(1, { message: 'La note doit être au minimum de 1' })
  @Max(5, { message: 'La note doit être au maximum de 5' })
  rating!: number;

  @IsOptional()
  @IsString({ message: "L'avis doit être une chaine de caractères" })
  @MaxLength(2000, {
    message: "L'avis ne doit pas dépasser 2000 caractères",
  })
  content?: string;
}
