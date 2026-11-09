import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterGender } from '../entities/master-gender.entity.js';
import { MasterPosition } from '../entities/master-position.entity.js';
import { MasterPrefix } from '../entities/master-prefix.entity.js';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(MasterGender)
    private readonly genders: Repository<MasterGender>,
    @InjectRepository(MasterPosition)
    private readonly positions: Repository<MasterPosition>,
    @InjectRepository(MasterPrefix)
    private readonly prefixes: Repository<MasterPrefix>,
  ) {}

  findGenders() {
    return this.genders.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  findPositions() {
    return this.positions.find({
      where: { isActive: true },
      order: { positionName: 'ASC' },
    });
  }

  findPrefixes(genderId?: number) {
    return this.prefixes.find({
      where: { isActive: true, ...(genderId ? { genderId } : {}) },
      order: { id: 'ASC' },
    });
  }
}
