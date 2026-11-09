import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Department } from '../entities/department.entity.js';
import { Employee } from '../entities/employee.entity.js';
import { EmployeeDepartmentHistory } from '../entities/employee-department-history.entity.js';
import { AddEmployeesDto } from './dto/add-employees.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { QueryDepartmentDto } from './dto/query-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private readonly repo: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(q: QueryDepartmentDto) {
    const { code, name, head, page = 1, pageSize = 10 } = q;

    const qb = this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.head', 'head')
      .orderBy('d.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (code) qb.andWhere('d.departmentCode LIKE :code', { code: `%${code}%` });
    if (name) qb.andWhere('d.departmentName LIKE :name', { name: `%${name}%` });
    if (head) {
      qb.andWhere("CONCAT(head.firstName, ' ', head.lastName) LIKE :head", {
        head: `%${head}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();

    // one extra query: employee count for just the departments on this page
    const ids = items.map((d) => d.id);
    const counts = ids.length
      ? await this.employees
          .createQueryBuilder('e')
          .select('e.departmentId', 'departmentId')
          .addSelect('COUNT(*)', 'count')
          .where('e.departmentId IN (:...ids)', { ids })
          .groupBy('e.departmentId')
          .getRawMany<{ departmentId: number; count: string }>()
      : [];

    const countById = new Map(
      counts.map((c) => [Number(c.departmentId), Number(c.count)]),
    );
    items.forEach((d) => (d.employeeCount = countById.get(d.id) ?? 0));

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const dept = await this.repo.findOne({
      where: { id },
      relations: { head: true },
    });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    if (dto.headEmployeeId != null) {
      throw new BadRequestException(
        'Add Department then add employees first, and then set the head employee.',
      );
    }
    try {
      const saved = await this.repo.save(this.repo.create(dto));
      return this.findOne(saved.id);
    } catch (e) {
      this.handleDbError(e);
    }
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    await this.assertHeadIsMember(dto.headEmployeeId, id);
    if (Object.keys(dto).length > 0) {
      try {
        await this.repo.update(id, dto);
      } catch (e) {
        this.handleDbError(e);
      }
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const members = await this.employees.count({ where: { departmentId: id } });
    if (members > 0) {
      throw new ConflictException(
        'Remove all employees from this department first',
      );
    }
    await this.repo.softDelete(id);
    return { deleted: true, id };
  }

  async findMembers(id: number) {
    await this.findOne(id);
    return this.employees.find({
      where: { departmentId: id },
      relations: { prefix: true, gender: true, position: true },
      order: { employeeCode: 'ASC' },
    });
  }

  async addEmployees(departmentId: number, dto: AddEmployeesDto) {
    await this.findOne(departmentId);
    const ids = [...new Set(dto.employeeIds)];
    const effectiveDate = dto.effectiveDate ?? this.today();

    await this.dataSource.transaction(async (manager) => {
      const found = await manager.find(Employee, { where: { id: In(ids) } });
      if (found.length !== ids.length) {
        throw new BadRequestException('One or more employees were not found');
      }

      const already = found.filter((e) => e.departmentId === departmentId);
      if (already.length > 0) {
        const codes = already.map((e) => e.employeeCode).join(', ');
        throw new BadRequestException(`Already in this department: ${codes}`);
      }

      const history = found.map((e) =>
        manager.create(EmployeeDepartmentHistory, {
          employeeId: e.id,
          fromDepartmentId: e.departmentId,
          toDepartmentId: departmentId,
          action: e.departmentId === null ? 'ADD' : 'TRANSFER',
          effectiveDate,
          remark: dto.remark ?? null,
        }),
      );

      await manager.update(Employee, { id: In(ids) }, { departmentId });
      await manager.save(history);
    });

    return this.findMembers(departmentId);
  }

  async removeEmployee(departmentId: number, employeeId: number) {
    await this.findOne(departmentId);

    await this.dataSource.transaction(async (manager) => {
      const employee = await manager.findOne(Employee, {
        where: { id: employeeId },
      });
      if (!employee || employee.departmentId !== departmentId) {
        throw new NotFoundException('Employee is not in this department');
      }

      await manager.update(Employee, employeeId, { departmentId: null });
      await manager.update(
        Department,
        { id: departmentId, headEmployeeId: employeeId },
        { headEmployeeId: null },
      );
      await manager.save(
        manager.create(EmployeeDepartmentHistory, {
          employeeId,
          fromDepartmentId: departmentId,
          toDepartmentId: null,
          action: 'REMOVE',
          effectiveDate: this.today(),
          remark: null,
        }),
      );
    });

    return { removed: true, employeeId };
  }

  private today() {
    return new Date().toLocaleDateString('en-CA');
  }

  private async assertHeadIsMember(
    headEmployeeId: number | null | undefined,
    departmentId: number,
  ) {
    if (headEmployeeId == null) return;
    const ok = await this.employees.exists({
      where: { id: headEmployeeId, departmentId },
    });
    if (!ok)
      throw new BadRequestException(
        'The head must be a member of this department',
      );
  }

  private handleDbError(e: unknown): never {
    if ((e as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw new ConflictException('Department code already exists');
    }
    throw e;
  }
}
