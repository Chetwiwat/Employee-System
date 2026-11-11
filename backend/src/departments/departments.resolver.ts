import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DepartmentPage, RemoveResult } from '../common/graphql-types.js';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { DepartmentsService } from './departments.service.js';
import { AddEmployeesDto } from './dto/add-employees.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { QueryDepartmentDto } from './dto/query-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(private readonly service: DepartmentsService) {}

  @Query(() => DepartmentPage, {
    description: 'Search, sort and page departments (with member counts)',
  })
  departments(
    @Args('query', { type: () => QueryDepartmentDto, nullable: true })
    query?: QueryDepartmentDto,
  ) {
    return this.service.findAll(query ?? {});
  }

  @Query(() => Department)
  department(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Query(() => [Employee], { description: 'Employees in a department' })
  departmentMembers(@Args('id', { type: () => Int }) id: number) {
    return this.service.findMembers(id);
  }

  @Mutation(() => Department)
  createDepartment(@Args('input') input: CreateDepartmentDto) {
    return this.service.create(input);
  }

  @Mutation(() => Department)
  updateDepartment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateDepartmentDto,
  ) {
    return this.service.update(id, input);
  }

  @Mutation(() => RemoveResult, {
    description: 'Soft-deletes an empty department',
  })
  async removeDepartment(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return { id, success: true };
  }

  @Mutation(() => [Employee], {
    description:
      'Adds or transfers employees into a department; returns its members',
  })
  addEmployeesToDepartment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: AddEmployeesDto,
  ) {
    return this.service.addEmployees(id, input);
  }

  @Mutation(() => RemoveResult, {
    description: 'Removes one employee from a department',
  })
  async removeEmployeeFromDepartment(
    @Args('id', { type: () => Int }) id: number,
    @Args('employeeId', { type: () => Int }) employeeId: number,
  ) {
    await this.service.removeEmployee(id, employeeId);
    return { id: employeeId, success: true };
  }
}
