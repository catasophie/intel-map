import { PartialType } from '@nestjs/mapped-types';
import { CreateBucketDto } from './create-bucket.dto.js';

export class UpdateBucketDto extends PartialType(CreateBucketDto) {}
