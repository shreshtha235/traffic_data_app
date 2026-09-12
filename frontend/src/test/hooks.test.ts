import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSummary } from '../hooks/useSummary';
import { useVehicleAnalytics } from '../hooks/useVehicleAnalytics';

const mockRows = [{ label: 'US', Free: 10, Moderate: 5, Heavy: 2, total: 17 }];
const mockSummary = {
  total_vehicles: 1000,
  total_countries: 5,
  total_segments: 30,
  top_country: 'US',
  dominant_type: 'Truck',
  dominant_type_pct: '45.0',
  most_congested: 'DE',
  most_congested_pct: '30.0',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useAnalytics', () => {
  it('fetches country distribution and returns data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockRows) }));
    const { result } = renderHook(() =>
      useAnalytics({ level: 'country' }, '2024-01-01', '2024-01-31'),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockRows);
  });

  it('includes country param when drilling into country', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetchMock);
    renderHook(() =>
      useAnalytics({ level: 'city', country: 'US' }, '2024-01-01', '2024-01-31'),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toContain('country=US');
  });
});

describe('useSummary', () => {
  it('returns summary data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockSummary) }));
    const { result } = renderHook(() => useSummary('2024-01-01', '2024-01-31'));
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.dominant_type).toBe('Truck');
    expect(result.current?.total_vehicles).toBe(1000);
  });
});

describe('useVehicleAnalytics', () => {
  it('fetches vehicle distribution', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockRows) }));
    const { result } = renderHook(() =>
      useVehicleAnalytics('2024-01-01', '2024-01-31'),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockRows);
  });

  it('includes country and city params when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) });
    vi.stubGlobal('fetch', fetchMock);
    renderHook(() =>
      useVehicleAnalytics('2024-01-01', '2024-01-31', 'US', 'NYC'),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('country=US');
    expect(url).toContain('city=NYC');
  });
});
