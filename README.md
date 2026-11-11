# Employee Records System

Employee and department management. React + Ant Design frontend, NestJS + TypeORM **GraphQL** API, MySQL.

## Requirements

- **Node.js 24.15.0** (`nvm use` reads `.nvmrc`)
- MySQL 8 with the provided database

## Setup

### 1. Database

Apply the schema changes (adds `department.location`, `department.deleted_at` and one index):

```bash
mysql -u <user> -p <database> < database/schema-change.sql
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

- **Employees:** add, edit, soft-delete; choose the department in the form; search by code, name (first or last), position, department; sort by column; server-side pagination.
- **Departments:** add, edit, soft-delete; search by code, name, head; sort by column (including member count); add and remove employees.
- Thai / English interface (switch in the top-right corner).
- Adding, transferring or removing an employee writes a row to `employee_department_history` inside a transaction.

## Business rules

- A department head must be a member of that department, so a new department has no head
  until employees are added.
- Removing the head from a department also clears the head.
- A department with members cannot be deleted.
- Deleting is soft (`deleted_at`), so history stays intact.

## API (GraphQL)

One endpoint: `POST /graphql`. Open `http://localhost:3000/graphql` in a browser for
**GraphiQL**, an editor with autocomplete and docs generated from the schema. The schema is
built code-first from the decorated classes and written to `backend/src/schema.gql`.

| Type     | Operation                                                       | Purpose                               |
| -------- | --------------------------------------------------------------- | ------------------------------------- |
| Query    | `genders`, `positions`, `prefixes(genderId)`                    | Dropdown data                         |
| Query    | `employees(query)`, `employee(id)`                              | Search, filter, sort, page; one item  |
| Mutation | `createEmployee`, `updateEmployee`, `removeEmployee`            | Create, update, soft-delete           |
| Query    | `departments(query)`, `department(id)`, `departmentMembers(id)` | Search, sort, page; one item; members |
| Mutation | `createDepartment`, `updateDepartment`, `removeDepartment`      | Create, update, soft-delete           |
| Mutation | `addEmployeesToDepartment`, `removeEmployeeFromDepartment`      | Add/transfer or remove members        |

Example:

```graphql
query {
  employees(
    query: { departmentId: 3, sortBy: "salary", sortOrder: "desc", pageSize: 5 }
  ) {
    total
    items {
      employeeCode
      firstName
      lastName
      salary
      department {
        departmentName
      }
    }
  }
}
```

Errors come back in the `errors` array with a readable `message` and an `extensions.code`
(`BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`).

## report.sql

`report.sql` lists male employees aged 25 to 35 (inclusive) with name, birth date and department name.
Employees without a department are included. Resigned employees are included.

## Notes

- Deployed demo: https://employee-system-s7mp.vercel.app/
- Deployed API (GraphiQL): https://employee-system-tau.vercel.app/graphql
