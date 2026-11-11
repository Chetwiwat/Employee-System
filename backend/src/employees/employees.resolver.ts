import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeePage, RemoveResult } from '../common/graphql-types.js';
import { Employee } from '../entities/employee.entity.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeesService } from './employees.service.js';

// A resolver is the GraphQL version of a controller:
// @Query = read operation, @Mutation = write operation.
@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(private readonly service: EmployeesService) {}

  @Query(() => EmployeePage, {
    description: 'Search, filter, sort and page employees',
  })
  employees(
    @Args('query', { type: () => QueryEmployeeDto, nullable: true })
    query?: QueryEmployeeDto,
  ) {
    return this.service.findAll(query ?? {});
  }

  @Query(() => String, {
    description:
      'Preview of the code the next new employee will get (assigned on save)',
  })
  nextEmployeeCode() {
    return this.service.nextEmployeeCode();
  }

  @Query(() => Employee)
  employee(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Employee)
  createEmployee(@Args('input') input: CreateEmployeeDto) {
    return this.service.create(input);
  }

  @Mutation(() => Employee)
  updateEmployee(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateEmployeeDto,
  ) {
    return this.service.update(id, input);
  }

  @Mutation(() => RemoveResult, { description: 'Soft-deletes an employee' })
  async removeEmployee(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return { id, success: true };
  }
}
