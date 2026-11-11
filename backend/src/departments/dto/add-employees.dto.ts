import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType('AddEmployeesInput')
export class AddEmployeesDto {
  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  employeeIds: number[];

  @Field({ nullable: true, description: 'YYYY-MM-DD, defaults to today' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string;
}
