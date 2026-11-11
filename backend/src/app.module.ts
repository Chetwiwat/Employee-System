import { join } from 'node:path';
import mysql2 from 'mysql2';
import { Module } from '@nestjs/common';
import { ApolloDriver } from '@nestjs/apollo';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
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
      useFactory: (c: ConfigService) => {
        return {
          type: 'mysql' as const,
          driver: mysql2,
          host: c.get<string>('DB_HOST'),
          port: Number(c.get<string>('DB_PORT')),
          username: c.get<string>('DB_USER'),
          password: c.get<string>('DB_PASS'),
          database: c.get<string>('DB_NAME'),
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
            c.get<string>('DB_SSL') === 'true'
              ? { rejectUnauthorized: true }
              : undefined,
          extra: { connectionLimit: 5, connectTimeout: 8000 },
          logging: ['error', 'warn'],
          retryAttempts: 2,
          retryDelay: 1000,
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code-first: the schema is generated from the decorated classes.
      // Write it to a file locally (handy to read); keep it in memory on
      // Vercel, whose filesystem is read-only.
      autoSchemaFile: process.env.VERCEL
        ? true
        : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // GraphiQL (the in-browser query editor) at /graphql, also in production
      graphiql: true,
      // Turn Nest exceptions into one readable message, without stack traces.
      formatError: (formatted) => {
        const original = formatted.extensions?.originalError as
          | { message?: string | string[]; statusCode?: number }
          | undefined;
        const message = original?.message ?? formatted.message;
        const codeByStatus: Record<number, string> = {
          404: 'NOT_FOUND',
          409: 'CONFLICT',
        };
        return {
          message: Array.isArray(message) ? message.join(', ') : message,
          locations: formatted.locations,
          path: formatted.path,
          extensions: {
            code:
              codeByStatus[original?.statusCode ?? 0] ??
              formatted.extensions?.code,
          },
        };
      },
    }),
    MasterModule,
    EmployeesModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
