import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { RoadSegment } from './segment.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const seg = (overrides = {}) => ({ id: 'uuid-1', country: 'US', city: 'NYC', road_name: 'Main', speed_limit_kmph: 60, ...overrides } as unknown as RoadSegment);

describe('SegmentsService', () => {
  let service: SegmentsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        SegmentsService,
        { provide: getRepositoryToken(RoadSegment), useFactory: mockRepo },
      ],
    }).compile();
    service = mod.get(SegmentsService);
    repo = mod.get(getRepositoryToken(RoadSegment));
  });

  it('create saves and returns segment', async () => {
    const dto = { country: 'US', city: 'NYC', road_name: 'Main', speed_limit_kmph: 60 };
    const segment = seg();
    repo.create.mockReturnValue(segment);
    repo.save.mockResolvedValue(segment);
    expect(await service.create(dto as any)).toBe(segment);
  });

  it('findAll returns array', async () => {
    repo.find.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });

  it('findOne returns segment when found', async () => {
    const segment = seg();
    repo.findOne.mockResolvedValue(segment);
    expect(await service.findOne('uuid-1')).toBe(segment);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('uuid-99')).rejects.toThrow(NotFoundException);
  });

  it('update merges dto and saves', async () => {
    const segment = seg();
    repo.findOne.mockResolvedValue(segment);
    repo.save.mockResolvedValue(seg({ country: 'CA' }));
    const result = await service.update('uuid-1', { country: 'CA' });
    expect(result.country).toBe('CA');
  });

  it('remove calls repository.remove', async () => {
    const segment = seg();
    repo.findOne.mockResolvedValue(segment);
    repo.remove.mockResolvedValue(undefined);
    await service.remove('uuid-1');
    expect(repo.remove).toHaveBeenCalledWith(segment);
  });
});
