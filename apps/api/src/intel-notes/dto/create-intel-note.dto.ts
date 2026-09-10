import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateIntelNoteDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @IsUUID()
  bucketId!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
