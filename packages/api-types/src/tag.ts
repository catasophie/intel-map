/**
 * Shared with apps/api. Keep in sync with:
 * apps/api/src/tags/tag.entity.ts
 * apps/api/src/tags/dto/*.ts
 */

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagInput {
  name: string
  color: string
}

export type UpdateTagInput = Partial<CreateTagInput>
