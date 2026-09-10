import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bucket } from './bucket.entity.js';
import { BucketsController } from './buckets.controller.js';
import { BucketsService } from './buckets.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Bucket])],
  controllers: [BucketsController],
  providers: [BucketsService],
  exports: [BucketsService],
})
export class BucketsModule {}
