import { Field, Int, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
@Entity('department')
export class Department {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'department_code', length: 20, unique: true })
  departmentCode: string;

  @Field()
  @Column({ name: 'department_name', length: 150 })
  departmentName: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'head_employee_id', type: 'int', nullable: true })
  headEmployeeId: number | null;

  @Field(() => Employee, { nullable: true })
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'head_employee_id' })
  head: Relation<Employee> | null;

  @Field(() => String, { nullable: true })
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

  // Not a column: filled in by DepartmentsService.findAll for list results
  @Field(() => Int, { nullable: true })
  employeeCount?: number;
}
