import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('master_gender')
export class MasterGender {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'gender_code', length: 10, unique: true })
  genderCode: string;

  @Column({ name: 'gender_name', length: 50 })
  genderName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
