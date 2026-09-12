import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getVehicleDistribution(from: Date, to: Date, country?: string, city?: string) {
    const params: unknown[] = [from, to];
    let whereClause = 'tt.recorded_at BETWEEN $1 AND $2';
    if (city) {
      params.push(country, city);
      whereClause += ` AND rs.country = $3 AND rs.city = $4`;
    } else if (country) {
      params.push(country);
      whereClause += ` AND rs.country = $3`;
    }
    return this.dataSource.query(
      `SELECT
        tt.vehicle_type AS label,
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph >= 0.7) AS free_count,
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph >= 0.4
                           AND tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.7)  AS moderate_count,
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.4)  AS heavy_count,
        COUNT(*) AS total_count
       FROM traffic_telemetry tt
       JOIN road_segments rs ON tt.segment_id = rs.id
       WHERE ${whereClause}
       GROUP BY tt.vehicle_type
       ORDER BY tt.vehicle_type`,
      params,
    );
  }

  async getSummary(from: Date, to: Date) {
    const [totals, topCountry, topVehicle, mostCongested] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) AS total_vehicles, COUNT(DISTINCT rs.country) AS total_countries,
                COUNT(DISTINCT rs.id) AS total_segments
         FROM traffic_telemetry tt
         JOIN road_segments rs ON tt.segment_id = rs.id
         WHERE tt.recorded_at BETWEEN $1 AND $2`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT rs.country, COUNT(*) AS cnt
         FROM traffic_telemetry tt
         JOIN road_segments rs ON tt.segment_id = rs.id
         WHERE tt.recorded_at BETWEEN $1 AND $2
         GROUP BY rs.country ORDER BY cnt DESC LIMIT 1`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT tt.vehicle_type,
                COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.4) AS heavy_cnt,
                ROUND(COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.4) * 100.0 / NULLIF(COUNT(*), 0), 1) AS percentage
         FROM traffic_telemetry tt
         JOIN road_segments rs ON tt.segment_id = rs.id
         WHERE tt.recorded_at BETWEEN $1 AND $2
         GROUP BY tt.vehicle_type ORDER BY heavy_cnt DESC LIMIT 1`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT rs.country,
                ROUND(COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.4) * 100.0 / NULLIF(COUNT(*), 0), 1) AS congestion_pct
         FROM traffic_telemetry tt
         JOIN road_segments rs ON tt.segment_id = rs.id
         WHERE tt.recorded_at BETWEEN $1 AND $2
         GROUP BY rs.country ORDER BY congestion_pct DESC LIMIT 1`,
        [from, to],
      ),
    ]);
    return {
      total_vehicles: parseInt(totals[0]?.total_vehicles ?? '0'),
      total_countries: parseInt(totals[0]?.total_countries ?? '0'),
      total_segments: parseInt(totals[0]?.total_segments ?? '0'),
      top_country: topCountry[0]?.country ?? '—',
      dominant_type: topVehicle[0]?.vehicle_type ?? '—',
      dominant_type_pct: topVehicle[0]?.percentage ?? '0',
      most_congested: mostCongested[0]?.country ?? '—',
      most_congested_pct: mostCongested[0]?.congestion_pct ?? '0',
    };
  }

  async getDistribution(from: Date, to: Date, country?: string, city?: string) {
    const params: unknown[] = [from, to];
    let groupBy: string;
    let selectLabel: string;
    let whereClause = 'tt.recorded_at BETWEEN $1 AND $2';

    if (city) {
      params.push(country, city);
      whereClause += ` AND rs.country = $3 AND rs.city = $4`;
      groupBy = 'rs.segment_code, rs.road_name';
      selectLabel = 'rs.segment_code AS label, rs.road_name';
    } else if (country) {
      params.push(country);
      whereClause += ` AND rs.country = $3`;
      groupBy = 'rs.city';
      selectLabel = 'rs.city AS label';
    } else {
      groupBy = 'rs.country';
      selectLabel = 'rs.country AS label';
    }

    return this.dataSource.query(
      `SELECT
        ${selectLabel},
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph >= 0.7) AS free_count,
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph >= 0.4
                           AND tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.7)  AS moderate_count,
        COUNT(*) FILTER (WHERE tt.speed_kmph::numeric / rs.speed_limit_kmph < 0.4)  AS heavy_count,
        COUNT(*) AS total_count
       FROM traffic_telemetry tt
       JOIN road_segments rs ON tt.segment_id = rs.id
       WHERE ${whereClause}
       GROUP BY ${groupBy}
       ORDER BY ${groupBy}`,
      params,
    );
  }
}
