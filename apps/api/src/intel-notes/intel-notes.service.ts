import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bucket } from '../buckets/bucket.entity.js';
import { Tag } from '../tags/tag.entity.js';
import { CreateIntelNoteDto } from './dto/create-intel-note.dto.js';
import { QueryIntelNoteDto } from './dto/query-intel-note.dto.js';
import { UpdateIntelNoteDto } from './dto/update-intel-note.dto.js';
import { IntelNote } from './intel-note.entity.js';

@Injectable()
export class IntelNotesService {
  constructor(
    @InjectRepository(IntelNote)
    private readonly intelNotesRepository: Repository<IntelNote>,
    @InjectRepository(Bucket)
    private readonly bucketsRepository: Repository<Bucket>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  private async resolveTags(tagIds?: string[]): Promise<Tag[] | undefined> {
    if (!tagIds) {
      return undefined;
    }
    if (tagIds.length === 0) {
      return [];
    }
    const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });
    if (tags.length !== tagIds.length) {
      throw new BadRequestException('One or more tagIds do not exist');
    }
    return tags;
  }

  async create(dto: CreateIntelNoteDto): Promise<IntelNote> {
    const bucket = await this.bucketsRepository.findOne({
      where: { id: dto.bucketId },
    });
    if (!bucket) {
      throw new BadRequestException(`Bucket ${dto.bucketId} not found`);
    }

    const tags = await this.resolveTags(dto.tagIds);

    const note = this.intelNotesRepository.create({
      title: dto.title,
      description: dto.description,
      lat: dto.lat,
      lng: dto.lng,
      bucketId: dto.bucketId,
      tags,
    });

    return this.intelNotesRepository.save(note);
  }

  findAll(query: QueryIntelNoteDto): Promise<IntelNote[]> {
    const bucketIds = query.bucketIds ?? (query.bucketId ? [query.bucketId] : undefined);

    return this.intelNotesRepository.find({
      where: bucketIds ? { bucketId: In(bucketIds) } : undefined,
      relations: { tags: true, bucket: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<IntelNote> {
    const note = await this.intelNotesRepository.findOne({
      where: { id },
      relations: { tags: true, bucket: true },
    });
    if (!note) {
      throw new NotFoundException(`Intel note ${id} not found`);
    }
    return note;
  }

  async update(id: string, dto: UpdateIntelNoteDto): Promise<IntelNote> {
    const note = await this.findOne(id);

    if (dto.bucketId && dto.bucketId !== note.bucketId) {
      const bucket = await this.bucketsRepository.findOne({
        where: { id: dto.bucketId },
      });
      if (!bucket) {
        throw new BadRequestException(`Bucket ${dto.bucketId} not found`);
      }
      note.bucketId = dto.bucketId;
    }

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.description !== undefined) note.description = dto.description;
    if (dto.lat !== undefined) note.lat = dto.lat;
    if (dto.lng !== undefined) note.lng = dto.lng;

    const tags = await this.resolveTags(dto.tagIds);
    if (tags !== undefined) {
      note.tags = tags;
    }

    return this.intelNotesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.intelNotesRepository.remove(note);
  }
}
