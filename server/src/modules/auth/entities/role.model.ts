import { Entity, PrimaryGeneratedColumn, ManyToMany, Column, JoinTable } from 'typeorm';
import { Permission } from './permission.model';
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  idRole!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, p => p.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'idRole' },
    inverseJoinColumn: { name: 'idPermission' },
  })
  permissions!: Permission[];
}


