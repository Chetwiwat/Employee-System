import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType('EmployeeQueryInput')
export class QueryEmployeeDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field({ nullable: true, description: 'Matches first name or last name' })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  positionId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @Field({
    nullable: true,
    description: 'code, name, birthDate, startDate, salary or status',
  })
  @IsOptional()
  @IsIn(['code', 'name', 'birthDate', 'startDate', 'salary', 'status'])
  sortBy?: 'code' | 'name' | 'birthDate' | 'startDate' | 'salary' | 'status';

  @Field({ nullable: true, description: 'asc or desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}
