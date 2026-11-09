import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Employee } from './employee.entity.js';

@Entity('department')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_code', length: 20, unique: true })
  departmentCode: string;

  @Column({ name: 'department_name', length: 150 })
  departmentName: string;

  @Column({ name: 'head_employee_id', type: 'int', nullable: true })
  headEmployeeId: number | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'head_employee_id' })
  head: Relation<Employee> | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @OneToMany(() => Employee, (e) => e.department)
  employees: Relation<Employee[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  employeeCount?: number;
}
