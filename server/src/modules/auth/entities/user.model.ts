import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, OneToMany, OneToOne, UpdateDateColumn } from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') 
  idUser!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  resetOTP?: string;
  
  @Column({ nullable: true, type: 'timestamp' })
  resetOTPExpires?: Date;

  @CreateDateColumn({name: "created_at"})
  createdAt!: Date;

  @UpdateDateColumn({name: "updated_at"})
  updatedAt!: Date;
}
