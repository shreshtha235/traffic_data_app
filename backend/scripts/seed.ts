const BASE_URL = process.env.API_URL ?? 'http://backend:3001/api';

const segments = [
  // India
  { segment_code: 'IN-MUM-WEH-001', country: 'India', city: 'Mumbai', road_name: 'Western Express Highway', speed_limit_kmph: 80, start_lat: 19.076, start_lng: 72.877, end_lat: 19.121, end_lng: 72.865 },
  { segment_code: 'IN-MUM-EEH-001', country: 'India', city: 'Mumbai', road_name: 'Eastern Express Highway', speed_limit_kmph: 80, start_lat: 19.076, start_lng: 72.905, end_lat: 19.145, end_lng: 72.921 },
  { segment_code: 'IN-DEL-NH48-001', country: 'India', city: 'Delhi', road_name: 'NH-48 Delhi-Gurugram', speed_limit_kmph: 100, start_lat: 28.612, start_lng: 77.209, end_lat: 28.502, end_lng: 77.088 },
  { segment_code: 'IN-DEL-RR-001', country: 'India', city: 'Delhi', road_name: 'Ring Road', speed_limit_kmph: 70, start_lat: 28.644, start_lng: 77.216, end_lat: 28.680, end_lng: 77.241 },
  { segment_code: 'IN-BLR-ORR-001', country: 'India', city: 'Bengaluru', road_name: 'Outer Ring Road', speed_limit_kmph: 60, start_lat: 12.971, start_lng: 77.594, end_lat: 12.935, end_lng: 77.624 },
  // USA
  { segment_code: 'US-NYC-FDR-001', country: 'USA', city: 'New York', road_name: 'FDR Drive', speed_limit_kmph: 88, start_lat: 40.748, start_lng: -73.971, end_lat: 40.778, end_lng: -73.946 },
  { segment_code: 'US-NYC-BQE-001', country: 'USA', city: 'New York', road_name: 'Brooklyn Queens Expressway', speed_limit_kmph: 88, start_lat: 40.694, start_lng: -73.990, end_lat: 40.718, end_lng: -73.952 },
  { segment_code: 'US-LA-I405-001', country: 'USA', city: 'Los Angeles', road_name: 'I-405 San Diego Freeway', speed_limit_kmph: 104, start_lat: 34.052, start_lng: -118.243, end_lat: 34.112, end_lng: -118.291 },
  // Germany
  { segment_code: 'DE-BER-A100-001', country: 'Germany', city: 'Berlin', road_name: 'Stadtautobahn A100', speed_limit_kmph: 100, start_lat: 52.520, start_lng: 13.405, end_lat: 52.497, end_lng: 13.381 },
  { segment_code: 'DE-MUC-A9-001', country: 'Germany', city: 'Munich', road_name: 'Autobahn A9', speed_limit_kmph: 130, start_lat: 48.137, start_lng: 11.575, end_lat: 48.189, end_lng: 11.612 },
  // UK
  { segment_code: 'GB-LON-M25-001', country: 'UK', city: 'London', road_name: 'M25 Motorway', speed_limit_kmph: 112, start_lat: 51.506, start_lng: -0.127, end_lat: 51.548, end_lng: -0.065 },
  { segment_code: 'GB-LON-A406-001', country: 'UK', city: 'London', road_name: 'North Circular A406', speed_limit_kmph: 72, start_lat: 51.538, start_lng: -0.172, end_lat: 51.572, end_lng: -0.138 },
  // France
  { segment_code: 'FR-PAR-A86-001', country: 'France', city: 'Paris', road_name: 'Autoroute A86', speed_limit_kmph: 110, start_lat: 48.858, start_lng: 2.347, end_lat: 48.901, end_lng: 2.389 },
  { segment_code: 'FR-PAR-PER-001', country: 'France', city: 'Paris', road_name: 'Périphérique', speed_limit_kmph: 80, start_lat: 48.865, start_lng: 2.321, end_lat: 48.830, end_lng: 2.368 },
  { segment_code: 'FR-LYO-A7-001', country: 'France', city: 'Lyon', road_name: 'Autoroute A7', speed_limit_kmph: 130, start_lat: 45.750, start_lng: 4.847, end_lat: 45.780, end_lng: 4.822 },
  // Japan
  { segment_code: 'JP-TKY-MEX-001', country: 'Japan', city: 'Tokyo', road_name: 'Metropolitan Expressway Route 1', speed_limit_kmph: 60, start_lat: 35.689, start_lng: 139.692, end_lat: 35.710, end_lng: 139.733 },
  { segment_code: 'JP-TKY-R357-001', country: 'Japan', city: 'Tokyo', road_name: 'Route 357 Bayshore', speed_limit_kmph: 60, start_lat: 35.630, start_lng: 139.774, end_lat: 35.651, end_lng: 139.810 },
  { segment_code: 'JP-OSA-HAN-001', country: 'Japan', city: 'Osaka', road_name: 'Hanshin Expressway', speed_limit_kmph: 70, start_lat: 34.693, start_lng: 135.502, end_lat: 34.720, end_lng: 135.489 },
  // Australia
  { segment_code: 'AU-SYD-M1-001', country: 'Australia', city: 'Sydney', road_name: 'M1 Pacific Motorway', speed_limit_kmph: 110, start_lat: -33.869, start_lng: 151.209, end_lat: -33.830, end_lng: 151.183 },
  { segment_code: 'AU-SYD-HBR-001', country: 'Australia', city: 'Sydney', road_name: 'Sydney Harbour Bridge', speed_limit_kmph: 60, start_lat: -33.852, start_lng: 151.210, end_lat: -33.839, end_lng: 151.211 },
  { segment_code: 'AU-MEL-CL-001', country: 'Australia', city: 'Melbourne', road_name: 'CityLink M1', speed_limit_kmph: 100, start_lat: -37.814, start_lng: 144.963, end_lat: -37.790, end_lng: 144.944 },
  // Brazil
  { segment_code: 'BR-SAO-MP-001', country: 'Brazil', city: 'São Paulo', road_name: 'Marginal Pinheiros', speed_limit_kmph: 70, start_lat: -23.548, start_lng: -46.638, end_lat: -23.601, end_lng: -46.700 },
  { segment_code: 'BR-SAO-RDA-001', country: 'Brazil', city: 'São Paulo', road_name: 'Rodoanel Mário Covas', speed_limit_kmph: 100, start_lat: -23.521, start_lng: -46.713, end_lat: -23.495, end_lng: -46.754 },
  { segment_code: 'BR-RIO-LA-001', country: 'Brazil', city: 'Rio de Janeiro', road_name: 'Linha Amarela', speed_limit_kmph: 80, start_lat: -22.900, start_lng: -43.172, end_lat: -22.871, end_lng: -43.210 },
  // Canada
  { segment_code: 'CA-TOR-401-001', country: 'Canada', city: 'Toronto', road_name: 'Highway 401 Express', speed_limit_kmph: 100, start_lat: 43.651, start_lng: -79.347, end_lat: 43.678, end_lng: -79.412 },
  { segment_code: 'CA-TOR-DVP-001', country: 'Canada', city: 'Toronto', road_name: 'Don Valley Parkway', speed_limit_kmph: 90, start_lat: 43.663, start_lng: -79.362, end_lat: 43.699, end_lng: -79.348 },
  { segment_code: 'CA-VAN-TC1-001', country: 'Canada', city: 'Vancouver', road_name: 'Trans-Canada Hwy 1', speed_limit_kmph: 90, start_lat: 49.283, start_lng: -123.120, end_lat: 49.303, end_lng: -122.987 },
  // UAE
  { segment_code: 'AE-DXB-SZR-001', country: 'UAE', city: 'Dubai', road_name: 'Sheikh Zayed Road E11', speed_limit_kmph: 120, start_lat: 25.197, start_lng: 55.274, end_lat: 25.229, end_lng: 55.301 },
  { segment_code: 'AE-DXB-E311-001', country: 'UAE', city: 'Dubai', road_name: 'Emirates Road E311', speed_limit_kmph: 120, start_lat: 25.151, start_lng: 55.377, end_lat: 25.179, end_lng: 55.406 },
  { segment_code: 'AE-ABU-E10-001', country: 'UAE', city: 'Abu Dhabi', road_name: 'Abu Dhabi-Dubai E10', speed_limit_kmph: 140, start_lat: 24.453, start_lng: 54.377, end_lat: 24.471, end_lng: 54.410 },
];

const vehicleTypes = ['car', 'truck', 'motorcycle', 'bus'];

const CONGESTION_PROFILES: Record<string, { heavy: number; moderate: number }> = {
  India:     { heavy: 0.38, moderate: 0.32 },
  USA:       { heavy: 0.30, moderate: 0.30 },
  Germany:   { heavy: 0.25, moderate: 0.30 },
  UK:        { heavy: 0.28, moderate: 0.32 },
  France:    { heavy: 0.22, moderate: 0.33 },
  Japan:     { heavy: 0.28, moderate: 0.35 },
  Australia: { heavy: 0.18, moderate: 0.30 },
  Brazil:    { heavy: 0.42, moderate: 0.30 },
  Canada:    { heavy: 0.20, moderate: 0.32 },
  UAE:       { heavy: 0.20, moderate: 0.28 },
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildTelemetry(segmentId: string, speedLimit: number, count: number, country: string) {
  const profile = CONGESTION_PROFILES[country] ?? { heavy: 0.30, moderate: 0.30 };
  const now = Date.now();
  return Array.from({ length: count }, () => {
    const roll = Math.random();
    const speedFactor = roll < profile.heavy
      ? randomBetween(0.08, 0.38)
      : roll < profile.heavy + profile.moderate
      ? randomBetween(0.4, 0.68)
      : randomBetween(0.72, 1.05);
    return {
      segment_id: segmentId,
      vehicle_type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      speed_kmph: parseFloat((speedLimit * speedFactor).toFixed(2)),
      vehicle_count: Math.floor(randomBetween(1, 30)),
      recorded_at: new Date(now - Math.floor(randomBetween(0, 30 * 86400000))).toISOString(),
    };
  });
}

async function seed() {
  console.log(`Seeding ${segments.length} road segments...`);
  for (const seg of segments) {
    const res = await fetch(`${BASE_URL}/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seg),
    });
    const data = await res.json() as { id: string };
    console.log(`  Created: ${seg.segment_code} → ${data.id}`);

    const readings = buildTelemetry(data.id, seg.speed_limit_kmph, 300, seg.country);
    for (let i = 0; i < readings.length; i += 50) {
      await fetch(`${BASE_URL}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readings: readings.slice(i, i + 50) }),
      });
    }
    console.log(`  Seeded 300 readings for ${seg.segment_code}`);
  }

  console.log(`\nDone. ${segments.length} segments, ${segments.length * 300} telemetry rows.`);
}

seed().catch(console.error);
