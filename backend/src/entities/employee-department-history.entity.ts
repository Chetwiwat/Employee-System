import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('employee_department_history')
export class EmployeeDepartmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @Column({ name: 'from_department_id', type: 'int', nullable: true })
  fromDepartmentId: number | null;

  @Column({ name: 'to_department_id', type: 'int', nullable: true })
  toDepartmentId: number | null;

  @Column({ type: 'enum', enum: ['ADD', 'TRANSFER', 'REMOVE'] })
  action: 'ADD' | 'TRANSFER' | 'REMOVE';

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
