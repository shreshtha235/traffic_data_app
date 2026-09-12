import { Test } from '@nestjs/testing';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

const mockService = () => ({
  createBatch: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('TelemetryController', () => {
  let controller: TelemetryController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [{ provide: TelemetryService, useFactory: mockService }],
    }).compile();
    controller = mod.get(TelemetryController);
    service = mod.get(TelemetryService);
  });

  it('createBatch delegates to service', async () => {
    service.createBatch.mockResolvedValue([{ id: 'uuid-1' }]);
    expect(await controller.createBatch({} as any)).toEqual([{ id: 'uuid-1' }]);
  });

  it('update (PATCH) delegates to service', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', speed_kmph: 60 });
    expect(await controller.update('uuid-1', { speed_kmph: 60 } as any)).toEqual({ id: 'uuid-1', speed_kmph: 60 });
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
