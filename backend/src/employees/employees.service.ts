import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
  ) {}

  async findAll(q: QueryEmployeeDto) {
    const { code, name, positionId, page = 1, pageSize = 10 } = q;

    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.prefix', 'prefix')
      .leftJoinAndSelect('e.gender', 'gender')
      .leftJoinAndSelect('e.position', 'position')
      .leftJoinAndSelect('e.department', 'department')
      .orderBy('e.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (code) qb.andWhere('e.employeeCode LIKE :code', { code: `%${code}%` });
    if (name) {
      qb.andWhere(
        new Brackets((b) =>
          b
            .where('e.firstName LIKE :name', { name: `%${name}%` })
            .orWhere('e.lastName LIKE :name'),
        ),
      );
    }
    if (positionId) qb.andWhere('e.positionId = :positionId', { positionId });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const employee = await this.repo.findOne({
      where: { id },
      relations: {
        prefix: true,
        gender: true,
        position: true,
        department: true,
      },
    });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    try {
      const saved = await this.repo.save(
        this.repo.create(this.toEntityData(dto)),
      );
      return this.findOne(saved.id);
    } catch (e) {
      this.handleDbError(e);
    }
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    const data = this.toEntityData(dto);
    if (Object.keys(data).length > 0) {
      try {
        await this.repo.update(id, data);
      } catch (e) {
        this.handleDbError(e);
      }
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { deleted: true, id };
  }

  private toEntityData(dto: UpdateEmployeeDto) {
    const { salary, ...rest } = dto;
    return {
      ...rest,
      ...(salary !== undefined && { salary: salary.toFixed(2) }),
    };
  }

  private handleDbError(e: unknown): never {
    const code = (e as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY')
      throw new ConflictException('Employee code already exists');
    if (code === 'ER_NO_REFERENCED_ROW_2') {
      throw new BadRequestException('Invalid prefixId, genderId or positionId');
    }
    throw e;
  }
}
