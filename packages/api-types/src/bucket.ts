/**
 * Shared with apps/api. Keep in sync with:
 * apps/api/src/buckets/bucket.entity.ts
 * apps/api/src/buckets/dto/*.ts
 */

export interface Bucket {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBucketInput {
  name: string
  description?: string
}

export type UpdateBucketInput = Partial<CreateBucketInput>
