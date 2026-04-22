import { IsBoolean, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class RecoFormDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  budget!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  safety!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  temperature!: number;

  @IsBoolean()
  @IsNotEmpty()
  familyFriendly!: boolean;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  natureLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  partyLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  sportLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  cultureLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  historyLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  gastronomyLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  cityLevel!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  relaxationLevel!: number;
}
