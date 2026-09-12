import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficTelemetry } from './telemetry.entity';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrafficTelemetry])],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}
