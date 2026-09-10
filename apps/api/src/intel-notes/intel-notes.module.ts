import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bucket } from '../buckets/bucket.entity.js';
import { Tag } from '../tags/tag.entity.js';
import { IntelNote } from './intel-note.entity.js';
import { IntelNotesController } from './intel-notes.controller.js';
import { IntelNotesService } from './intel-notes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([IntelNote, Bucket, Tag])],
  controllers: [IntelNotesController],
  providers: [IntelNotesService],
  exports: [IntelNotesService],
})
export class IntelNotesModule {}
