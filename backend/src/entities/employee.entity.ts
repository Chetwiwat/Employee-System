import { Field, Int, ObjectType } from '@nestjs/graphql';
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

// @ObjectType/@Field expose this class in the GraphQL schema;
// @Entity/@Column map it to the database. Fields without @Field stay internal.
@ObjectType()
@Entity('employee')
export class Employee {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'employee_code', length: 20, unique: true })
  employeeCode: string;

  @Field(() => Int)
  @Column({ name: 'prefix_id' })
  prefixId: number;

  @Field()
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Field()
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Field(() => Int)
  @Column({ name: 'gender_id' })
  genderId: number;

  @Field({ description: 'YYYY-MM-DD' })
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Field(() => Int)
  @Column({ name: 'position_id' })
  positionId: number;

  // A string keeps the exact decimal value (MySQL returns decimals as strings)
  @Field({ description: 'Decimal as a string, e.g. "35000.00"' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salary: string;

  @Field({ description: 'YYYY-MM-DD' })
  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Field({ description: 'ACTIVE or RESIGNED' })
  @Column({ type: 'enum', enum: ['ACTIVE', 'RESIGNED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'RESIGNED';

  @Field(() => Int, { nullable: true })
  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number | null;

  @Field(() => MasterPrefix)
  @ManyToOne(() => MasterPrefix)
  @JoinColumn({ name: 'prefix_id' })
  prefix: MasterPrefix;

  @Field(() => MasterGender)
  @ManyToOne(() => MasterGender)
  @JoinColumn({ name: 'gender_id' })
  gender: MasterGender;

  @Field(() => MasterPosition)
  @ManyToOne(() => MasterPosition)
  @JoinColumn({ name: 'position_id' })
  position: MasterPosition;

  @Field(() => Department, { nullable: true })
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
