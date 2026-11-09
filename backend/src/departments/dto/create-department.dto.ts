import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  departmentCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  departmentName: string;

  @IsOptional()
  @IsInt()
  headEmployeeId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string | null;
}
