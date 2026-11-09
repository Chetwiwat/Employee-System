import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddEmployeesDto } from './dto/add-employees.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { QueryDepartmentDto } from './dto/query-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { DepartmentsService } from './departments.service.js';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  findAll(@Query() query: QueryDepartmentDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get(':id/employees')
  members(@Param('id', ParseIntPipe) id: number) {
    return this.service.findMembers(id);
  }

  @Post(':id/employees')
  addEmployees(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddEmployeesDto,
  ) {
    return this.service.addEmployees(id, dto);
  }

  @Delete(':id/employees/:employeeId')
  removeEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    return this.service.removeEmployee(id, employeeId);
  }
}
