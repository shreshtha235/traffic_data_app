import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TrafficTelemetry } from './telemetry.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const rec = (overrides = {}) => ({ id: 'uuid-1', speed_kmph: 50, vehicle_count: 1, ...overrides } as unknown as TrafficTelemetry);

describe('TelemetryService', () => {
  let service: TelemetryService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        TelemetryService,
        { provide: getRepositoryToken(TrafficTelemetry), useFactory: mockRepo },
      ],
    }).compile();
    service = mod.get(TelemetryService);
    repo = mod.get(getRepositoryToken(TrafficTelemetry));
  });

  it('createBatch saves all readings', async () => {
    const entities = [rec()];
    repo.create.mockReturnValue(entities);
    repo.save.mockResolvedValue(entities);
    expect(await service.createBatch({ readings: [] } as any)).toBe(entities);
  });

  it('findOne returns record', async () => {
    const record = rec();
    repo.findOne.mockResolvedValue(record);
    expect(await service.findOne('uuid-1')).toBe(record);
  });

  it('findOne throws when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('uuid-99')).rejects.toThrow(NotFoundException);
  });

  it('update patches mutable fields', async () => {
    repo.findOne.mockResolvedValue(rec());
    repo.save.mockResolvedValue(rec({ speed_kmph: 80 }));
    const result = await service.update('uuid-1', { speed_kmph: 80 });
    expect(result.speed_kmph).toBe(80);
  });

  it('remove calls repository.remove', async () => {
    const record = rec();
    repo.findOne.mockResolvedValue(record);
    repo.remove.mockResolvedValue(undefined);
    await service.remove('uuid-1');
    expect(repo.remove).toHaveBeenCalledWith(record);
  });
});
