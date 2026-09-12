import { IsString, IsNumber, MaxLength, IsOptional, Min } from 'class-validator';

export class UpdateSegmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  road_name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed_limit_kmph?: number;

  @IsOptional()
  @IsNumber()
  start_lat?: number;

  @IsOptional()
  @IsNumber()
  start_lng?: number;

  @IsOptional()
  @IsNumber()
  end_lat?: number;

  @IsOptional()
  @IsNumber()
  end_lng?: number;
}
