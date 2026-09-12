import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ?? '/api';

export interface Summary {
  total_vehicles: number;
  total_countries: number;
  total_segments: number;
  top_country: string;
  dominant_type: string;
  dominant_type_pct: string;
  most_congested: string;
  most_congested_pct: string;
}

export function useSummary(from: string, to: string) {
  const [data, setData] = useState<Summary | null>(null);
  useEffect(() => {
    const params = new URLSearchParams({ from, to });
    fetch(`${API}/analytics/summary?${params}`)
      .then((res) => res.json())
      .then(setData);
  }, [from, to]);
  return data;
}
