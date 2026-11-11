import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { EmployeeDepartmentHistory } from '../entities/employee-department-history.entity.js';
import { EmployeesResolver } from './employees.resolver.js';
import { EmployeesService } from './employees.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Department, EmployeeDepartmentHistory]),
  ],
  providers: [EmployeesService, EmployeesResolver],
})
export class EmployeesModule {}
