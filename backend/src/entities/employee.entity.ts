import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { MasterPrefix } from './master-prefix.entity.js';
import { MasterGender } from './master-gender.entity.js';
import { MasterPosition } from './master-position.entity.js';
import { Department } from './department.entity.js';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_code', length: 20, unique: true })
  employeeCode: string;

  @Column({ name: 'prefix_id' })
  prefixId: number;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'gender_id' })
  genderId: number;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string; // 'YYYY-MM-DD'

  @Column({ name: 'position_id' })
  positionId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salary: string; // MySQL decimals come back as strings

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ type: 'enum', enum: ['ACTIVE', 'RESIGNED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'RESIGNED';

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number | null;

  @ManyToOne(() => MasterPrefix)
  @JoinColumn({ name: 'prefix_id' })
  prefix: MasterPrefix;

  @ManyToOne(() => MasterGender)
  @JoinColumn({ name: 'gender_id' })
  gender: MasterGender;

  @ManyToOne(() => MasterPosition)
  @JoinColumn({ name: 'position_id' })
  position: MasterPosition;

  @ManyToOne(() => Department, (d) => d.employees, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Relation<Department> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
