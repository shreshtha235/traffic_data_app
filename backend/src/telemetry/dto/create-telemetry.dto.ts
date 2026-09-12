import { IsString, IsNumber, IsDateString, IsEnum, IsArray, ValidateNested, IsNotEmpty, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class TelemetryItemDto {
  @IsString()
  @IsNotEmpty()
  segment_id: string;

  @IsEnum(['car', 'truck', 'motorcycle', 'bus'])
  vehicle_type: string;

  @IsNumber()
  @Min(0)
  @Max(300)
  speed_kmph: number;

  @IsNumber()
  @Min(1)
  vehicle_count: number;

  @IsDateString()
  recorded_at: string;
}

export class CreateTelemetryBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TelemetryItemDto)
  readings: TelemetryItemDto[];
}
