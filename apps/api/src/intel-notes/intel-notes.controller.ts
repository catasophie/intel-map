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
  Query,
} from '@nestjs/common';
import { CreateIntelNoteDto } from './dto/create-intel-note.dto.js';
import { QueryIntelNoteDto } from './dto/query-intel-note.dto.js';
import { UpdateIntelNoteDto } from './dto/update-intel-note.dto.js';
import { IntelNote } from './intel-note.entity.js';
import { IntelNotesService } from './intel-notes.service.js';

@Controller('notes')
export class IntelNotesController {
  constructor(private readonly intelNotesService: IntelNotesService) {}

  @Post()
  create(@Body() dto: CreateIntelNoteDto): Promise<IntelNote> {
    return this.intelNotesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryIntelNoteDto): Promise<IntelNote[]> {
    return this.intelNotesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IntelNote> {
    return this.intelNotesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntelNoteDto,
  ): Promise<IntelNote> {
    return this.intelNotesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.intelNotesService.remove(id);
  }
}
