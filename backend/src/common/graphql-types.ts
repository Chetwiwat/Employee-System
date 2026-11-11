import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';

// Result shapes that are not database entities.

@ObjectType()
export class EmployeePage {
  @Field(() => [Employee])
  items: Employee[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}

@ObjectType()
export class DepartmentPage {
  @Field(() => [Department])
  items: Department[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}

/** Returned by mutations that delete or detach something. */
@ObjectType()
export class RemoveResult {
  @Field(() => Int, { description: 'ID of the removed record' })
  id: number;

  @Field()
  success: boolean;
}
