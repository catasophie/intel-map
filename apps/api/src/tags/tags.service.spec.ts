import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { Tag } from './tag.entity.js';
import { TagsService } from './tags.service.js';

type MockRepository = Partial<Record<keyof Repository<Tag>, ReturnType<typeof vi.fn>>>;

const createMockRepository = (): MockRepository => ({
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  remove: vi.fn(),
});

describe('TagsService', () => {
  let service: TagsService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get(TagsService);
    repository = module.get(getRepositoryToken(Tag));
  });

  it('creates a tag', async () => {
    const dto = { name: 'HVT', color: '#FF0000' };
    const entity = { id: '1', ...dto };
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(entity);
  });

  it('returns all tags', async () => {
    const tags = [{ id: '1' }, { id: '2' }];
    repository.find!.mockResolvedValue(tags);

    const result = await service.findAll();

    expect(result).toEqual(tags);
  });

  it('throws NotFoundException when tag does not exist', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a tag', async () => {
    const tag = { id: '1', name: 'HVT', color: '#FF0000' };
    repository.findOne!.mockResolvedValue(tag);
    repository.save!.mockImplementation(async (t) => t);

    const result = await service.update('1', { color: '#00FF00' });

    expect(result.color).toBe('#00FF00');
  });

  it('removes a tag', async () => {
    const tag = { id: '1', name: 'HVT', color: '#FF0000' };
    repository.findOne!.mockResolvedValue(tag);
    repository.remove!.mockResolvedValue(tag);

    await service.remove('1');

    expect(repository.remove).toHaveBeenCalledWith(tag);
  });
});
