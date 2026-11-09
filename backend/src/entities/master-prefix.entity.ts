import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MasterGender } from './master-gender.entity.js';

@Entity('master_prefix')
export class MasterPrefix {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'prefix_name', length: 50, unique: true })
  prefixName: string;

  @Column({ name: 'gender_id', type: 'int', nullable: true })
  genderId: number | null;

  @ManyToOne(() => MasterGender, { nullable: true })
  @JoinColumn({ name: 'gender_id' })
  gender: MasterGender | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
