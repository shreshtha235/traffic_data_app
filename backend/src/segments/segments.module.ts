import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadSegment } from './segment.entity';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoadSegment])],
  controllers: [SegmentsController],
  providers: [SegmentsService],
})
export class SegmentsModule {}
