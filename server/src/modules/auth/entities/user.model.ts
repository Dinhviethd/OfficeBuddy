import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, OneToMany, OneToOne, UpdateDateColumn } from 'typeorm';
import {Role} from './role.model'
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') 
  idUser!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  resetOTP?: string;
  
  @Column({ nullable: true, type: 'timestamp' })
  resetOTPExpires?: Date;

  @CreateDateColumn({name: "created_at"})
  createdAt!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updatedAt!: Date;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role!: Role;
}
