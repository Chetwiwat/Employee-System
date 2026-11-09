import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeeDepartmentHistory } from './entities/employee-department-history.entity.js';
import { MasterGender } from './entities/master-gender.entity.js';
import { MasterPosition } from './entities/master-position.entity.js';
import { MasterPrefix } from './entities/master-prefix.entity.js';
import { MasterModule } from './master/master.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { DepartmentsModule } from './departments/departments.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'mysql',
        host: c.get('DB_HOST'),
        port: +c.get('DB_PORT'),
        username: c.get('DB_USER'),
        password: c.get('DB_PASS'),
        database: c.get('DB_NAME'),
        entities: [
          Employee,
          Department,
          EmployeeDepartmentHistory,
          MasterGender,
          MasterPosition,
          MasterPrefix,
        ],
        synchronize: false,
        ssl:
          c.get('DB_SSL') === 'true' ? { rejectUnauthorized: true } : undefined,
        extra: { connectionLimit: 5 },
      }),
    }),
    MasterModule,
    EmployeesModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
