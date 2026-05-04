import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.model';

@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Document, document => document.chunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column()
  content!: string;

  @Column({ type: 'vector', nullable: true })
  embedding?: number[];

  @Column({ name: 'chunk_index', type: 'int', nullable: true })
  chunkIndex?: number;
}
