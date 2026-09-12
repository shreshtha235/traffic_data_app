import { useState, useEffect } from 'react';
import type { VehicleRow } from '../types';

const API = import.meta.env.VITE_API_URL ?? '/api';

export function useVehicleAnalytics(from: string, to: string, country?: string, city?: string) {
  const [data, setData] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ from, to });
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    setLoading(true);
    fetch(`${API}/analytics/vehicle?${params}`)
      .then((res) => res.json())
      .then((rows: VehicleRow[]) => setData(rows))
      .finally(() => setLoading(false));
  }, [from, to, country, city]);

  return { data, loading };
}
