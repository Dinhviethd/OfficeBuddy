import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  idUser!: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password!: string;

  @Column({ type: 'text', default: 'user' })
  role!: string;

  @Column({ name: 'full_name', default: '' })
  fullName!: string;

  @Column({ nullable: true })
  resetOTP?: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetOTPExpires?: Date;

  @Column({ name: 'last_login', nullable: true, type: 'timestamptz' })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
