import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { Bucket } from '../buckets/bucket.entity.js';
import { Tag } from '../tags/tag.entity.js';
import { IntelNote } from './intel-note.entity.js';
import { IntelNotesService } from './intel-notes.service.js';

type MockRepository<T extends object = any> = Partial<
  Record<keyof Repository<T>, ReturnType<typeof vi.fn>>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  remove: vi.fn(),
});

describe('IntelNotesService', () => {
  let service: IntelNotesService;
  let noteRepository: MockRepository<IntelNote>;
  let bucketRepository: MockRepository<Bucket>;
  let tagRepository: MockRepository<Tag>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelNotesService,
        {
          provide: getRepositoryToken(IntelNote),
          useValue: createMockRepository<IntelNote>(),
        },
        {
          provide: getRepositoryToken(Bucket),
          useValue: createMockRepository<Bucket>(),
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: createMockRepository<Tag>(),
        },
      ],
    }).compile();

    service = module.get(IntelNotesService);
    noteRepository = module.get(getRepositoryToken(IntelNote));
    bucketRepository = module.get(getRepositoryToken(Bucket));
    tagRepository = module.get(getRepositoryToken(Tag));
  });

  it('creates a note when the bucket exists', async () => {
    const dto = {
      title: 'Sighting',
      lat: 1.23,
      lng: 4.56,
      bucketId: 'bucket-1',
    };
    bucketRepository.findOne!.mockResolvedValue({ id: 'bucket-1' });
    const entity = { id: 'note-1', ...dto };
    noteRepository.create!.mockReturnValue(entity);
    noteRepository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(bucketRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'bucket-1' },
    });
    expect(result).toEqual(entity);
  });

  it('throws BadRequestException when bucket does not exist on create', async () => {
    bucketRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.create({
        title: 'Sighting',
        lat: 1,
        lng: 1,
        bucketId: 'missing-bucket',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when tagIds contain unknown ids', async () => {
    bucketRepository.findOne!.mockResolvedValue({ id: 'bucket-1' });
    tagRepository.find!.mockResolvedValue([{ id: 'tag-1' }]);

    await expect(
      service.create({
        title: 'Sighting',
        lat: 1,
        lng: 1,
        bucketId: 'bucket-1',
        tagIds: ['tag-1', 'tag-2'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('filters notes by bucketId', async () => {
    noteRepository.find!.mockResolvedValue([]);

    await service.findAll({ bucketId: 'bucket-1' });

    expect(noteRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { bucketId: expect.anything() },
      }),
    );
  });

  it('throws NotFoundException when note does not exist', async () => {
    noteRepository.findOne!.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes a note', async () => {
    const note = { id: 'note-1' };
    noteRepository.findOne!.mockResolvedValue(note);
    noteRepository.remove!.mockResolvedValue(note);

    await service.remove('note-1');

    expect(noteRepository.remove).toHaveBeenCalledWith(note);
  });
});
