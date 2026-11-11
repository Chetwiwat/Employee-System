import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterGender } from '../entities/master-gender.entity.js';
import { MasterPosition } from '../entities/master-position.entity.js';
import { MasterPrefix } from '../entities/master-prefix.entity.js';
import { MasterResolver } from './master.resolver.js';
import { MasterService } from './master.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterGender, MasterPosition, MasterPrefix]),
  ],
  providers: [MasterService, MasterResolver],
})
export class MasterModule {}
