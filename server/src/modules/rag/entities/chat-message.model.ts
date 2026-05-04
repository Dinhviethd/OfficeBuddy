import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.model';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: ChatSession;

  @Column({ name: 'sender_role' })
  senderRole!: string;

  @Column()
  content!: string;

  @Column({ type: 'jsonb', nullable: true })
  citations?: unknown;

  @Column({ default: 'none' })
  feedback!: string;

  @Column({ name: 'feedback_reason', nullable: true })
  feedbackReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
