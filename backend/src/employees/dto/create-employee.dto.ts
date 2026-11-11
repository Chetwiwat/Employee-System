import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// @InputType/@Field describe the GraphQL input; the class-validator
// decorators still run through the global ValidationPipe.
@InputType('CreateEmployeeInput')
export class CreateEmployeeDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  employeeCode: string;

  @Field(() => Int)
  @IsInt()
  prefixId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @Field(() => Int)
  @IsInt()
  genderId: number;

  @Field({ description: 'YYYY-MM-DD' })
  @IsDateString()
  birthDate: string;

  @Field(() => Int)
  @IsInt()
  positionId: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salary?: number;

  @Field({ description: 'YYYY-MM-DD' })
  @IsDateString()
  startDate: string;

  @Field({ nullable: true, description: 'ACTIVE or RESIGNED' })
  @IsOptional()
  @IsIn(['ACTIVE', 'RESIGNED'])
  status?: 'ACTIVE' | 'RESIGNED';

  // null = no department; omitted on update = keep current department
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  departmentId?: number | null;
}
