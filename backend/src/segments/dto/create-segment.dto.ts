import { IsString, IsNumber, MaxLength, IsNotEmpty, Min } from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  segment_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  road_name: string;

  @IsNumber()
  @Min(0)
  speed_limit_kmph: number;

  @IsNumber()
  start_lat: number;

  @IsNumber()
  start_lng: number;

  @IsNumber()
  end_lat: number;

  @IsNumber()
  end_lng: number;
}
