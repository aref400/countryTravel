import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveRecoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsObject()
  @IsNotEmpty()
  criteriaSnapshot!: Record<string, any>;

  @IsArray()
  @IsNotEmpty()
  resultsSnapshot!: Record<string, any>[];
}
