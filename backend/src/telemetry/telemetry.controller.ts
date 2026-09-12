import { Controller, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryBatchDto } from './dto/create-telemetry.dto';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateTelemetryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  speed_kmph?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  vehicle_count?: number;

  @IsOptional()
  @Type(() => Date)
  recorded_at?: Date;
}

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() dto: CreateTelemetryBatchDto) {
    return this.telemetryService.createBatch(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTelemetryDto) {
    return this.telemetryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.telemetryService.remove(id);
  }
}
