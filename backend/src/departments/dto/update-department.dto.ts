import { InputType, PartialType } from '@nestjs/graphql';
import { CreateDepartmentDto } from './create-department.dto.js';

@InputType('UpdateDepartmentInput')
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
