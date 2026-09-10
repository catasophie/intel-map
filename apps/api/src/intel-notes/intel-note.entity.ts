import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Bucket } from '../buckets/bucket.entity.js';
import { Tag } from '../tags/tag.entity.js';

@Entity('intel_notes')
export class IntelNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  /** Rich text markdown produced by the tiptap editor on the frontend. */
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @ManyToOne(() => Bucket, (bucket) => bucket.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bucket_id' })
  bucket!: Relation<Bucket>;

  @Column({ name: 'bucket_id' })
  bucketId!: string;

  @ManyToMany(() => Tag, (tag) => tag.notes, { cascade: false })
  @JoinTable({
    name: 'intel_note_tags',
    joinColumn: { name: 'intel_note_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Relation<Tag>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
