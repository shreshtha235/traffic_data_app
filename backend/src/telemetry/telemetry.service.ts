import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrafficTelemetry } from './telemetry.entity';
import { CreateTelemetryBatchDto } from './dto/create-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(TrafficTelemetry)
    private readonly telemetryRepository: Repository<TrafficTelemetry>,
  ) {}

  async createBatch(dto: CreateTelemetryBatchDto): Promise<TrafficTelemetry[]> {
    const entities = this.telemetryRepository.create(dto.readings);
    return await this.telemetryRepository.save(entities);
  }

  async findOne(id: string): Promise<TrafficTelemetry> {
    const record = await this.telemetryRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Telemetry record ${id} not found`);
    return record;
  }

  async update(id: string, fields: Partial<Pick<TrafficTelemetry, 'speed_kmph' | 'vehicle_count' | 'recorded_at'>>): Promise<TrafficTelemetry> {
    const record = await this.findOne(id);
    Object.assign(record, fields);
    return await this.telemetryRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.telemetryRepository.remove(record);
  }
}
