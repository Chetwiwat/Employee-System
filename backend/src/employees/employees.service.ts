import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { EmployeeDepartmentHistory } from '../entities/employee-department-history.entity.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(q: QueryEmployeeDto) {
    const {
      code,
      name,
      positionId,
      departmentId,
      sortBy,
      sortOrder,
      page = 1,
      pageSize = 10,
    } = q;

    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.prefix', 'prefix')
      .leftJoinAndSelect('e.gender', 'gender')
      .leftJoinAndSelect('e.position', 'position')
      .leftJoinAndSelect('e.department', 'department')
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
    if (departmentId) {
      qb.andWhere('e.departmentId = :departmentId', { departmentId });
    }

    // Only whitelisted columns are sortable; e.id keeps paging stable.
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const sortColumns: Record<string, string[]> = {
      code: ['e.employeeCode'],
      name: ['e.firstName', 'e.lastName'],
      birthDate: ['e.birthDate'],
      startDate: ['e.startDate'],
      salary: ['e.salary'],
      status: ['e.status'],
    };
    for (const col of sortBy ? sortColumns[sortBy] : []) {
      qb.addOrderBy(col, order);
    }
    qb.addOrderBy('e.id', 'DESC');

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
    const { departmentId = null, ...rest } = dto;
    let id: number;
    try {
      id = await this.dataSource.transaction(async (manager) => {
        await this.assertDepartmentExists(manager, departmentId);
        const saved = await manager.save(
          manager.create(Employee, {
            ...this.toEntityData(rest),
            departmentId,
          }),
        );
        await this.recordDepartmentChange(
          manager,
          saved.id,
          null,
          departmentId,
        );
        return saved.id;
      });
    } catch (e) {
      this.handleDbError(e);
    }
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const current = await this.findOne(id);
    const { departmentId, ...rest } = dto;
    const data = this.toEntityData(rest);
    const departmentChanged =
      departmentId !== undefined && departmentId !== current.departmentId;

    try {
      await this.dataSource.transaction(async (manager) => {
        if (departmentChanged) {
          await this.assertDepartmentExists(manager, departmentId);
          // A head who leaves their department is no longer its head.
          if (current.departmentId !== null) {
            await manager.update(
              Department,
              { id: current.departmentId, headEmployeeId: id },
              { headEmployeeId: null },
            );
          }
          await this.recordDepartmentChange(
            manager,
            id,
            current.departmentId,
            departmentId,
          );
        }
        const changes = departmentChanged ? { ...data, departmentId } : data;
        if (Object.keys(changes).length > 0) {
          await manager.update(Employee, id, changes);
        }
      });
    } catch (e) {
      this.handleDbError(e);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { deleted: true, id };
  }

  private async assertDepartmentExists(
    manager: EntityManager,
    departmentId: number | null,
  ) {
    if (departmentId === null) return;
    const ok = await manager.exists(Department, {
      where: { id: departmentId },
    });
    if (!ok) {
      throw new BadRequestException(`Department ${departmentId} not found`);
    }
  }

  private async recordDepartmentChange(
    manager: EntityManager,
    employeeId: number,
    from: number | null,
    to: number | null,
  ) {
    if (from === to) return;
    const action = from === null ? 'ADD' : to === null ? 'REMOVE' : 'TRANSFER';
    await manager.save(
      manager.create(EmployeeDepartmentHistory, {
        employeeId,
        fromDepartmentId: from,
        toDepartmentId: to,
        action,
        effectiveDate: new Date().toLocaleDateString('en-CA'),
        remark: null,
      }),
    );
  }

  private toEntityData(dto: Omit<UpdateEmployeeDto, 'departmentId'>) {
    const { salary, ...rest } = dto;
    return {
      ...rest,
      ...(salary !== undefined && { salary: salary.toFixed(2) }),
    };
  }

  private handleDbError(e: unknown): never {
    if (e instanceof HttpException) throw e;
    const code = (e as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY')
      throw new ConflictException('Employee code already exists');
    if (code === 'ER_NO_REFERENCED_ROW_2') {
      throw new BadRequestException(
        'Invalid prefixId, genderId, positionId or departmentId',
      );
    }
    throw e;
  }
}
