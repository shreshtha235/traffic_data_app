import { Test } from '@nestjs/testing';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('SegmentsController', () => {
  let controller: SegmentsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [SegmentsController],
      providers: [{ provide: SegmentsService, useFactory: mockService }],
    }).compile();
    controller = mod.get(SegmentsController);
    service = mod.get(SegmentsService);
  });

  it('create delegates to service', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1' });
    expect(await controller.create({} as any)).toEqual({ id: 'uuid-1' });
  });

  it('findAll delegates to service', async () => {
    service.findAll.mockResolvedValue([{ id: 'uuid-1' }]);
    expect(await controller.findAll()).toEqual([{ id: 'uuid-1' }]);
  });

  it('findOne delegates to service', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-5' });
    expect(await controller.findOne('uuid-5')).toEqual({ id: 'uuid-5' });
  });

  it('replace (PUT) delegates to service.update', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', country: 'UK' });
    expect(await controller.replace('uuid-1', { country: 'UK' } as any)).toEqual({ id: 'uuid-1', country: 'UK' });
  });

  it('update (PATCH) delegates to service.update', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1' });
    expect(await controller.update('uuid-1', {} as any)).toEqual({ id: 'uuid-1' });
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
