import { PartialType } from '@nestjs/mapped-types';
import { CreateIntelNoteDto } from './create-intel-note.dto.js';

export class UpdateIntelNoteDto extends PartialType(CreateIntelNoteDto) {}
