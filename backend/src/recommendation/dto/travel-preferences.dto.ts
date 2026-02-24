import { IsInt, Min, Max, IsBoolean, IsArray, IsEnum, IsString } from "class-validator";
import { TravelType } from "../types/recommendation.types";

export class TravelPreferencesDto {
   @IsInt() @Min(1) @Max(5) 
   budget: number;
   @IsInt() @Min(1) @Max(5) 
   safety: number;
   @IsArray() @IsEnum(TravelType, { each: true })
   travelTypes: TravelType[];
   @IsInt() @Min(1) @Max(12) 
   travelMonth: number;
   @IsInt() @Min(1) @Max(5) 
   climate: number;
   @IsBoolean()
   withChildren: boolean;
   @IsString()
   region: string;
   @IsInt() @Min(1) @Max(5) 
   touristPopularity: number;   
}