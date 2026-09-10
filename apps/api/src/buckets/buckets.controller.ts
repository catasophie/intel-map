import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Bucket } from './bucket.entity.js';
import { BucketsService } from './buckets.service.js';
import { CreateBucketDto } from './dto/create-bucket.dto.js';
import { UpdateBucketDto } from './dto/update-bucket.dto.js';

@Controller('buckets')
export class BucketsController {
  constructor(private readonly bucketsService: BucketsService) {}

  @Post()
  create(@Body() dto: CreateBucketDto): Promise<Bucket> {
    return this.bucketsService.create(dto);
  }

  @Get()
  findAll(): Promise<Bucket[]> {
    return this.bucketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Bucket> {
    return this.bucketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBucketDto,
  ): Promise<Bucket> {
    return this.bucketsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bucketsService.remove(id);
  }
}
