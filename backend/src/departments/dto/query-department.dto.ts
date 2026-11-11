import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType('DepartmentQueryInput')
export class QueryDepartmentDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true, description: "Matches the head's full name" })
  @IsOptional()
  @IsString()
  head?: string;

  @Field({ nullable: true, description: 'code, name or employeeCount' })
  @IsOptional()
  @IsIn(['code', 'name', 'employeeCount'])
  sortBy?: 'code' | 'name' | 'employeeCount';

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
