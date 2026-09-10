import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bucket } from './bucket.entity.js';
import { CreateBucketDto } from './dto/create-bucket.dto.js';
import { UpdateBucketDto } from './dto/update-bucket.dto.js';

@Injectable()
export class BucketsService {
  constructor(
    @InjectRepository(Bucket)
    private readonly bucketsRepository: Repository<Bucket>,
  ) {}

  create(dto: CreateBucketDto): Promise<Bucket> {
    const bucket = this.bucketsRepository.create(dto);
    return this.bucketsRepository.save(bucket);
  }

  findAll(): Promise<Bucket[]> {
    return this.bucketsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Bucket> {
    const bucket = await this.bucketsRepository.findOne({ where: { id } });
    if (!bucket) {
      throw new NotFoundException(`Bucket ${id} not found`);
    }
    return bucket;
  }

  async update(id: string, dto: UpdateBucketDto): Promise<Bucket> {
    const bucket = await this.findOne(id);
    Object.assign(bucket, dto);
    try {
      return await this.bucketsRepository.save(bucket);
    } catch (error) {
      throw new ConflictException((error as Error).message);
    }
  }

  async remove(id: string): Promise<void> {
    const bucket = await this.findOne(id);
    await this.bucketsRepository.remove(bucket);
  }
}
