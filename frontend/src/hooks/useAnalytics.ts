import { useState, useEffect } from 'react';
import type { DistributionRow, DrillState } from '../types';

const API = import.meta.env.VITE_API_URL ?? '/api';

export function useAnalytics(drill: DrillState, from: string, to: string) {
  const [data, setData] = useState<DistributionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ from, to });
    if (drill.country) params.set('country', drill.country);
    if (drill.city) params.set('city', drill.city);

    setLoading(true);
    fetch(`${API}/analytics/country?${params}`)
      .then((res) => res.json())
      .then((rows: DistributionRow[]) => setData(rows))
      .finally(() => setLoading(false));
  }, [drill.level, drill.country, drill.city, from, to]);

  return { data, loading };
}
