import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RoadSegment } from '../segments/segment.entity';

@Index(['segment_id', 'recorded_at'])
@Entity('traffic_telemetry')
export class TrafficTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RoadSegment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'segment_id' })
  segment: RoadSegment;

  @Column('uuid')
  segment_id: string;

  @Column({ type: 'enum', enum: ['car', 'truck', 'motorcycle', 'bus'] })
  vehicle_type: string;

  @Column('decimal', { precision: 5, scale: 2 })
  speed_kmph: number;

  @Column('int')
  vehicle_count: number;

  @Column({ type: 'timestamptz' })
  recorded_at: Date;

  @CreateDateColumn()
  created_at: Date;
}