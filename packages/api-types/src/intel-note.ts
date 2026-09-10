/**
 * Shared with apps/api. Keep in sync with:
 * apps/api/src/intel-notes/intel-note.entity.ts
 * apps/api/src/intel-notes/dto/*.ts
 */
import type { Bucket } from './bucket.js'
import type { Tag } from './tag.js'

export interface IntelNote {
  id: string
  title: string
  description?: string | null
  lat: number
  lng: number
  bucketId: string
  bucket?: Bucket
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface CreateIntelNoteInput {
  title: string
  description?: string
  lat: number
  lng: number
  bucketId: string
  tagIds?: string[]
}

export type UpdateIntelNoteInput = Partial<CreateIntelNoteInput>

export interface QueryIntelNoteInput {
  bucketId?: string
  bucketIds?: string[]
}
