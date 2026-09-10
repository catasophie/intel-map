import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class QueryIntelNoteDto {
  @IsOptional()
  @IsUUID()
  bucketId?: string;

  /** Comma separated list of bucket ids, e.g. ?bucketIds=id1,id2,id3 */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : value,
  )
  @IsArray()
  @IsUUID('4', { each: true })
  bucketIds?: string[];
}
