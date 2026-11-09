import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { EmployeeDepartmentHistory } from '../entities/employee-department-history.entity.js';
import { DepartmentsController } from './departments.controller.js';
import { DepartmentsService } from './departments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Employee, EmployeeDepartmentHistory]),
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
