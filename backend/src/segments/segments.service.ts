import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegment } from './segment.entity';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(RoadSegment)
    private readonly segmentRepository: Repository<RoadSegment>,
  ) {}

  async create(dto: CreateSegmentDto): Promise<RoadSegment> {
    const segment = this.segmentRepository.create(dto);
    return await this.segmentRepository.save(segment);
  }

  async findAll(): Promise<RoadSegment[]> {
    return await this.segmentRepository.find();
  }

  async findOne(id: string): Promise<RoadSegment> {
    const segment = await this.segmentRepository.findOne({ where: { id } });
    if (!segment) throw new NotFoundException(`Segment ${id} not found`);
    return segment;
  }

  async update(id: string, dto: UpdateSegmentDto): Promise<RoadSegment> {
    const segment = await this.findOne(id);
    Object.assign(segment, dto);
    return await this.segmentRepository.save(segment);
  }

  async remove(id: string): Promise<void> {
    const segment = await this.findOne(id);
    await this.segmentRepository.remove(segment);
  }
}
