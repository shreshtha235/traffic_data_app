import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('road_segments')
export class RoadSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  segment_code: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 200 })
  road_name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  speed_limit_kmph: number;

  @Column('decimal', { precision: 10, scale: 6 })
  start_lat: number;

  @Column('decimal', { precision: 10, scale: 6 })
  start_lng: number;

  @Column('decimal', { precision: 10, scale: 6 })
  end_lat: number;

  @Column('decimal', { precision: 10, scale: 6 })
  end_lng: number;

  @CreateDateColumn()
  created_at: Date;
}