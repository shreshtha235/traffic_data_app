export interface VehicleRow {
  label: string;
  free_count: string;
  moderate_count: string;
  heavy_count: string;
  total_count: string;
}

export interface DistributionRow {
  label: string;
  free_count: string;
  moderate_count: string;
  heavy_count: string;
  total_count: string;
}

export type DrillLevel = 'country' | 'city' | 'segment';

export interface DrillState {
  level: DrillLevel;
  country?: string;
  city?: string;
}
