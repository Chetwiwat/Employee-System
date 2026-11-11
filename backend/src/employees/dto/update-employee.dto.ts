import { InputType, PartialType } from '@nestjs/graphql';
import { CreateEmployeeDto } from './create-employee.dto.js';

// Same fields as create, all optional (validation rules are kept)
@InputType('UpdateEmployeeInput')
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
