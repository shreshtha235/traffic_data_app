import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';

const mockDataSource = () => ({ query: jest.fn() });

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let ds: ReturnType<typeof mockDataSource>;
  const from = new Date('2024-01-01');
  const to = new Date('2024-01-31');

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getDataSourceToken(), useFactory: mockDataSource },
      ],
    }).compile();
    service = mod.get(AnalyticsService);
    ds = mod.get(getDataSourceToken());
  });

  describe('getVehicleDistribution', () => {
    it('queries with only date range when no country/city', async () => {
      ds.query.mockResolvedValue([]);
      await service.getVehicleDistribution(from, to);
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('BETWEEN $1 AND $2'), [from, to]);
    });

    it('adds country filter when country provided', async () => {
      ds.query.mockResolvedValue([]);
      await service.getVehicleDistribution(from, to, 'US');
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('rs.country = $3'), [from, to, 'US']);
    });

    it('adds city filter when both country and city provided', async () => {
      ds.query.mockResolvedValue([]);
      await service.getVehicleDistribution(from, to, 'US', 'NYC');
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('rs.city = $4'), [from, to, 'US', 'NYC']);
    });
  });

  describe('getSummary', () => {
    it('returns parsed summary from query results', async () => {
      ds.query
        .mockResolvedValueOnce([{ total_vehicles: '100', total_countries: '5', total_segments: '10' }])
        .mockResolvedValueOnce([{ country: 'US' }])
        .mockResolvedValueOnce([{ vehicle_type: 'Truck', percentage: '45.5' }])
        .mockResolvedValueOnce([{ country: 'DE', congestion_pct: '30.0' }]);

      const result = await service.getSummary(from, to);
      expect(result.total_vehicles).toBe(100);
      expect(result.top_country).toBe('US');
      expect(result.dominant_type).toBe('Truck');
      expect(result.most_congested).toBe('DE');
    });

    it('returns defaults when queries return empty', async () => {
      ds.query.mockResolvedValue([]);
      const result = await service.getSummary(from, to);
      expect(result.total_vehicles).toBe(0);
      expect(result.dominant_type).toBe('—');
    });
  });

  describe('getDistribution', () => {
    it('groups by country when no filters', async () => {
      ds.query.mockResolvedValue([]);
      await service.getDistribution(from, to);
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('rs.country AS label'), [from, to]);
    });

    it('groups by city when country provided', async () => {
      ds.query.mockResolvedValue([]);
      await service.getDistribution(from, to, 'US');
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('rs.city AS label'), [from, to, 'US']);
    });

    it('groups by segment when country and city provided', async () => {
      ds.query.mockResolvedValue([]);
      await service.getDistribution(from, to, 'US', 'NYC');
      expect(ds.query).toHaveBeenCalledWith(expect.stringContaining('rs.segment_code AS label'), [from, to, 'US', 'NYC']);
    });
  });
});
