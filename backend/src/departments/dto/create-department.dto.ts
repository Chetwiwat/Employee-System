import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType('CreateDepartmentInput')
export class CreateDepartmentDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  departmentCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  departmentName: string;

  // null clears the head
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  headEmployeeId?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string | null;
}
