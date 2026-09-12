CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE road_segments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_code     VARCHAR(100) NOT NULL UNIQUE,
  country          VARCHAR(100) NOT NULL,
  city             VARCHAR(100) NOT NULL,
  road_name        VARCHAR(200) NOT NULL,
  speed_limit_kmph NUMERIC(5,2)  NOT NULL,
  start_lat        NUMERIC(10,6) NOT NULL,
  start_lng        NUMERIC(10,6) NOT NULL,
  end_lat          NUMERIC(10,6) NOT NULL,
  end_lng          NUMERIC(10,6) NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_segments_country ON road_segments(country);
CREATE INDEX idx_segments_city    ON road_segments(city);

CREATE TYPE vehicle_type_enum AS ENUM ('car', 'truck', 'motorcycle', 'bus');

CREATE TABLE traffic_telemetry (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_id    UUID NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
  vehicle_type  vehicle_type_enum NOT NULL,
  speed_kmph    NUMERIC(5,2)  NOT NULL,
  vehicle_count INT           NOT NULL,
  recorded_at   TIMESTAMPTZ   NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_segment_time ON traffic_telemetry(segment_id, recorded_at);
CREATE INDEX idx_telemetry_vehicle_type ON traffic_telemetry(vehicle_type);
