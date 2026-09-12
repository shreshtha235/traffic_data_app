# Traffic Data App — Design Documentation

## Table of Contents
1. [Objective](#objective)
2. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Real-Time Data Flows](#real-time-data-flows)
7. [UI Design Decisions](#ui-design-decisions)
9. [Bonus Points](#bonus-points)

---

## Objective

Build a web application that presents traffic data using interactive and creative graphs.

**Requirements:**
1. Frontend:
○ Create two interactive graphs:
■ Country-wise Traffic (Bar/Line/Pie Chart)
■ Vehicle Type Distribution (Bar/Line/Pie Chart)
○ The UI should be clean, responsive, and user-friendly.
2. Backend:
○ Provide an API to deliver traffic data.
○ Utilize a framework of your choice (Django, Rails, or Node.js preferred).
3. Database:
○ Store traffic data in a database (PostgreSQL or MySQL preferred).
○ Enable data updates.
4. Scalability:
○ Explain how the system would scale from 5 RPS to 50 RPS to 500 RPS.

**Bonus:** Docker, CI/CD pipeline, unit tests.

---

## Database Design

### Brainstorming Journey

**First instinct — simple flat one table:**
```
traffic_data: country, city, vehicle_type, volume, avg_speed, congestion_level, recorded_at
```
Problem: Traffic state is a property of a **road segment**, not a city.

**Second question — do we need a vehicles table?**

Two options considered:
- Option A: `vehicles` table with `id`, `type`, `license_plate`
- Option B: Sensor on road segment counts vehicle types passing → `vehicle_type` is just a field on telemetry

Option B was chosen. The system simulates **road sensors** (inductive loops, cameras), not GPS tracking. Sensors aggregate by vehicle type at the point of measurement. No vehicles table needed — `vehicle_type` is an enum dimension on the telemetry row.

**Third question — what metric goes on the charts?**

Initial design used `SUM(volume)` — total vehicle count per country,  meaningless without context

The meaningful metric is **congestion level distribution** — what percentage of time was traffic free, moderate, heavy, or at standstill. This answers the real question: *"How bad was traffic in each country during this period?"*

Congestion level is derived, not stored:

Storing `congestion_level` in the table would be a normalization violation — it is fully derivable from `avg_speed_kmh` and `speed_limit_kmh` (which lives on `road_segments`).

**Fourth question — do we need density?**

The fundamental traffic equation: `flow = density × speed` (q = k × v).

Since we store `flow_vph` (vehicles/hour, what sensors directly count) and `avg_speed_kmh`, density is derivable: `density = flow / speed`. Storing density would be redundant. Two fields are enough.

**Final decision — two tables:**

`road_segments` owns the static properties of a road. `traffic_telemetry` owns the time-series sensor readings.

---

### Final Schema

```sql
-- Static road network
CREATE TABLE road_segments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_code      VARCHAR(100) NOT NULL,
  country           VARCHAR(100) NOT NULL,
  city              VARCHAR(100) NOT NULL,
  road_name         VARCHAR(200) NOT NULL,
  speed_limit_kmph  DECIMAL(5,2) NOT NULL,
  start_lat         DECIMAL(10,6),
  start_lng         DECIMAL(10,6),
  end_lat           DECIMAL(10,6),
  end_lng           DECIMAL(10,6),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series sensor readings
CREATE TABLE traffic_telemetry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id      UUID REFERENCES road_segments(id) ON DELETE CASCADE,
  vehicle_type    VARCHAR(20) NOT NULL,   -- car, truck, bus, motorcycle
  speed_kmph      DECIMAL(5,2) NOT NULL,
  vehicle_count   INTEGER NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_segment    ON traffic_telemetry(segment_id);
CREATE INDEX idx_telemetry_type       ON traffic_telemetry(vehicle_type);
CREATE INDEX idx_telemetry_recorded   ON traffic_telemetry(recorded_at);
CREATE INDEX idx_segments_country     ON road_segments(country);
CREATE INDEX idx_segments_city        ON road_segments(city);
```

**Key design decisions:**
- `recorded_at` is `TIMESTAMPTZ` not `DATE` — preserves hourly patterns.
- `congestion_level` computed at query time from `speed_kmph / speed_limit_kmph`.
- `vehicle_count` captures vehicles observed in this reading; `speed_kmph` is the observed speed.
- UUIDs for primary keys — no integer sequence collisions across distributed inserts.
- `country` and `city` live on `road_segments`, not `traffic_telemetry` 

---
---

## API Design

### Analytics Endpoints (powers the charts) 

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/country` | Country congestion distribution |
| GET | `/api/analytics/vehicle` | Vehicle type congestion distribution |

**Query params (all analytics endpoints):** one api with filtering capability
```
?from=2024-01-01T00:00:00    ISO timestamp
&to=2024-01-01T23:59:59
&country=India               drill-down filter
&city=Mumbai                 drill-down filter
&segment_id=42               deepest drill-down
```

**Country distribution response:**
```json
[
  {
    "country": "India",
    "free_pct": 12.0,
    "moderate_pct": 23.0,
    "heavy_pct": 40.0,
    "standstill_pct": 25.0,
    "total_readings": 1440
  }
]
```

**Vehicle distribution response:**
```json
[
  {
    "vehicle_type": "truck",
    "free_pct": 20.0,
    "moderate_pct": 35.0,
    "heavy_pct": 35.0,
    "standstill_pct": 10.0,
    "total_readings": 288
  }
]
```

## Real-Time Data Flows

Three distinct flows handle data movement:

### Flow 1 — Sensor data ingestion (write side)

```
Road sensor → POST /api/telemetry/batch → TypeORM → PostgreSQL
```

Sensors fire REST POST with a batch of readings every 60 seconds. In this project the seeder simulates this. 

### Flow 2 — Live dashboard updates (read side)

```
Browser setInterval(60s) → GET /api/analytics/country → NestJS → PostgreSQL → charts re-render
                         → GET /api/analytics/vehicle  ↗
                         → GET /api/analytics/summary  ↗
```

Frontend polls all three analytics endpoints every 60 seconds via `setInterval`.

### Flow 3 — Historical bulk import (one-time)

```
CSV file → POST /api/telemetry/import → parse → batch insert → DB
```

Traffic agencies provide historical data as CSV files. 
---

## UI Design Decisions

### Why congestion % instead of vehicle count

The initial approach showed `SUM(volume)` — total vehicle count per country. Rejected as menaingless.

Congestion level distribution (% of time free/moderate/heavy/standstill) answers the real question.

### Drill-down design (3 levels)

The country chart supports three levels of drill-down:

```
Level 1 — Country    (India, China, USA...)
Level 2 — City       (Mumbai, Delhi, Bengaluru...)
Level 3 — Road seg.  (Western Expressway, NH-48, Eastern Exp...)
```

### Cross-filter: country → vehicle chart

Clicking a country (or city, or road segment) in the left chart automatically updates the vehicle distribution chart on the right to show vehicle data filtered to that selection.

Backend: same vehicle distribution endpoint, `?country=India` param added.

This turns two independent charts into a linked analytical view — a key pattern in data dashboards.

### Chart type toggle (Bar / Line / Pie)

- **Bar** — default. 
- **Line** 
- **Pie** —

All three use the same API response — the frontend transforms the data shape for each chart type.

---

## Bonus Points

### Docker

`docker-compose.yml` defines three services:
- `postgres` — PostgreSQL 16, volume-mounted for persistence
- `backend` — NestJS app, built from `backend/Dockerfile`
- `frontend` — React/Vite, built from `frontend/Dockerfile`, proxied via Nginx on port 8080

```bash
docker compose up --build -d
docker compose exec backend npm run seed
# open http://localhost:8080
```

### CI/CD (GitHub Actions)

Pipeline runs on every push to `main` and `develop`:

### Unit Tests

- covered BE + FE
---


