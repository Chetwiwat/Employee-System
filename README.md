# Employee Records System

Employee and department management. React + Ant Design frontend, NestJS + TypeORM API, MySQL.

## Requirements

- **Node.js 24.15.0** (`nvm use` reads `.nvmrc`)
- MySQL 8 with the provided database

## Setup

### 1. Database

Apply the schema changes (adds `department.location`, `department.deleted_at` and one index):

```bash
mysql -u <user> -p <database> < database/schema-changes.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env     # then fill in your DB credentials
npm install
npm run start:dev        # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Features

- **Employees:** add, edit, soft-delete; search by code, name (first or last), position; server-side pagination.
- **Departments:** add, edit, soft-delete; search by code, name, head; add and remove employees.
- Adding, transferring or removing an employee writes a row to `employee_department_history` inside a transaction.

## Business rules

- A department head must be a member of that department.
- Removing the head from a department also clears the head.
- A department with members cannot be deleted.
- Deleting is soft (`deleted_at`), so history stays intact.

## API (REST)

| Method                | Path                                                       | Purpose                     |
| --------------------- | ---------------------------------------------------------- | --------------------------- |
| GET                   | `/master/genders`, `/master/positions`, `/master/prefixes` | Dropdown data               |
| GET                   | `/employees?code=&name=&positionId=&page=&pageSize=`       | List and search             |
| POST / PATCH / DELETE | `/employees`, `/employees/:id`                             | Create, update, soft-delete |
| GET                   | `/departments?code=&name=&head=&page=&pageSize=`           | List and search             |
| POST / PATCH / DELETE | `/departments`, `/departments/:id`                         | Create, update, soft-delete |
| GET / POST            | `/departments/:id/employees`                               | List members, add employees |
| DELETE                | `/departments/:id/employees/:employeeId`                   | Remove an employee          |

## Report.sql

`Report.sql` lists male employees aged 25 to 35 (inclusive) with name, birth date and department name.
Employees without a department are included. Resigned employees are included.
It assumes the male gender code is `'M'`, so change it if your data differs.

## Notes

- Frontend is not responsive (per the assignment).
- Deployed demo: <url, if you deploy>
