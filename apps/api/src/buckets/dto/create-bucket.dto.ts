import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBucketDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
