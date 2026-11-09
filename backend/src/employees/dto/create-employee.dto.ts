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

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  employeeCode: string;

  @IsInt()
  prefixId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsInt()
  genderId: number;

  @IsDateString()
  birthDate: string;

  @IsInt()
  positionId: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salary?: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'RESIGNED'])
  status?: 'ACTIVE' | 'RESIGNED';
}
