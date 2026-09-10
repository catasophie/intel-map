import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { Tag } from './tag.entity.js';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  create(dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagsRepository.create(dto);
    return this.tagsRepository.save(tag);
  }

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} not found`);
    }
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return this.tagsRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }
}
