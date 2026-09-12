const BASE_URL = 'http://localhost:3001/api';

const extraSegments = [
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

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Realistic congestion profiles per country
const CONGESTION_PROFILES: Record<string, { heavy: number; moderate: number }> = {
  India:     { heavy: 0.38, moderate: 0.32 },
  Japan:     { heavy: 0.28, moderate: 0.35 },
  Brazil:    { heavy: 0.42, moderate: 0.30 },
  France:    { heavy: 0.22, moderate: 0.33 },
  UAE:       { heavy: 0.20, moderate: 0.28 },
  Australia: { heavy: 0.18, moderate: 0.30 },
  Canada:    { heavy: 0.20, moderate: 0.32 },
};

function buildTelemetry(segmentId: string, speedLimit: number, count: number, country: string) {
  const profile = CONGESTION_PROFILES[country] ?? { heavy: 0.30, moderate: 0.30 };
  const readings = [];
  const now = Date.now();
  // spread over last 30 days for richer date range
  for (let i = 0; i < count; i++) {
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const roll = Math.random();
    let speedFactor: number;
    if (roll < profile.heavy) speedFactor = randomBetween(0.08, 0.38);
    else if (roll < profile.heavy + profile.moderate) speedFactor = randomBetween(0.4, 0.68);
    else speedFactor = randomBetween(0.72, 1.05);

    readings.push({
      segment_id: segmentId,
      vehicle_type: vehicleType,
      speed_kmph: parseFloat((speedLimit * speedFactor).toFixed(2)),
      vehicle_count: Math.floor(randomBetween(1, 30)),
      recorded_at: new Date(now - Math.floor(randomBetween(0, 30 * 86400000))).toISOString(),
    });
  }
  return readings;
}

async function seedExtra() {
  const segmentIds: Record<string, string> = {};

  console.log('Adding extra road segments...');
  for (const seg of extraSegments) {
    const res = await fetch(`${BASE_URL}/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seg),
    });
    const data = await res.json() as { id: string };
    segmentIds[seg.segment_code] = data.id;
    console.log(`  Created: ${seg.segment_code} → ${data.id}`);
  }

  console.log('\nSeeding telemetry (300 readings per segment)...');
  for (const seg of extraSegments) {
    const id = segmentIds[seg.segment_code];
    const readings = buildTelemetry(id, seg.speed_limit_kmph, 300, seg.country);
    for (let i = 0; i < readings.length; i += 50) {
      await fetch(`${BASE_URL}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readings: readings.slice(i, i + 50) }),
      });
    }
    console.log(`  Seeded 300 readings for ${seg.segment_code}`);
  }

  console.log(`\nDone. Added ${extraSegments.length} segments, ${extraSegments.length * 300} telemetry rows.`);
}

seedExtra().catch(console.error);
