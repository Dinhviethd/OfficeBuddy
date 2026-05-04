import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DocumentChunk } from './document-chunk.model';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ name: 'doc_number', nullable: true })
  docNumber?: string;

  @Column({ name: 'source_url', nullable: true })
  sourceUrl?: string;

  @Column({ name: 'publish_date', type: 'date', nullable: true })
  publishDate?: Date;

  @Column({ name: 'security_level', default: 'Thường' })
  securityLevel!: string;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => DocumentChunk, chunk => chunk.document)
  chunks!: DocumentChunk[];
}
