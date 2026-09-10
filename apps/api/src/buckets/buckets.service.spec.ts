import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { Bucket } from './bucket.entity.js';
import { BucketsService } from './buckets.service.js';

type MockRepository = Partial<Record<keyof Repository<Bucket>, ReturnType<typeof vi.fn>>>;

const createMockRepository = (): MockRepository => ({
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  remove: vi.fn(),
});

describe('BucketsService', () => {
  let service: BucketsService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BucketsService,
        {
          provide: getRepositoryToken(Bucket),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get(BucketsService);
    repository = module.get(getRepositoryToken(Bucket));
  });

  it('creates a bucket', async () => {
    const dto = { name: 'Operation Foo' };
    const entity = { id: '1', ...dto };
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('returns all buckets', async () => {
    const buckets = [{ id: '1' }, { id: '2' }];
    repository.find!.mockResolvedValue(buckets);

    const result = await service.findAll();

    expect(result).toEqual(buckets);
  });

  it('returns a single bucket', async () => {
    const bucket = { id: '1', name: 'Op Foo' };
    repository.findOne!.mockResolvedValue(bucket);

    const result = await service.findOne('1');

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(bucket);
  });

  it('throws NotFoundException when bucket does not exist', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a bucket', async () => {
    const bucket = { id: '1', name: 'Old', description: null };
    repository.findOne!.mockResolvedValue(bucket);
    repository.save!.mockImplementation(async (b) => b);

    const result = await service.update('1', { name: 'New' });

    expect(result.name).toBe('New');
  });

  it('removes a bucket', async () => {
    const bucket = { id: '1', name: 'Op Foo' };
    repository.findOne!.mockResolvedValue(bucket);
    repository.remove!.mockResolvedValue(bucket);

    await service.remove('1');

    expect(repository.remove).toHaveBeenCalledWith(bucket);
  });
});
