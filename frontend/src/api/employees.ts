import { gql } from "./client";
import type { Employee, Paged } from "../types";

export type EmployeeSortKey =
  | "code"
  | "name"
  | "birthDate"
  | "startDate"
  | "salary"
  | "status";

export interface EmployeeQuery {
  code?: string;
  name?: string;
  positionId?: number;
  departmentId?: number;
  sortBy?: EmployeeSortKey;
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface EmployeePayload {
  employeeCode: string;
  prefixId: number;
  firstName: string;
  lastName: string;
  genderId: number;
  birthDate: string;
  positionId: number;
  salary?: number;
  startDate: string;
  status?: "ACTIVE" | "RESIGNED";
  departmentId?: number | null;
}

// The fields the UI needs for an employee. In GraphQL the client chooses
// the fields, so every query below asks for exactly this set.
export const EMPLOYEE_FIELDS = `
  id employeeCode prefixId firstName lastName genderId birthDate
  positionId salary startDate status departmentId
  prefix { id prefixName genderId }
  gender { id genderCode genderName }
  position { id positionName }
  department { id departmentCode departmentName }
`;

export const employeeApi = {
  list: (query: EmployeeQuery) =>
    gql<{ employees: Paged<Employee> }>(
      `query Employees($query: EmployeeQueryInput) {
        employees(query: $query) {
          total page pageSize
          items { ${EMPLOYEE_FIELDS} }
        }
      }`,
      { query },
    ).then((d) => d.employees),

  create: (input: EmployeePayload) =>
    gql<{ createEmployee: Employee }>(
      `mutation CreateEmployee($input: CreateEmployeeInput!) {
        createEmployee(input: $input) { ${EMPLOYEE_FIELDS} }
      }`,
      { input },
    ).then((d) => d.createEmployee),

  update: (id: number, input: Partial<EmployeePayload>) =>
    gql<{ updateEmployee: Employee }>(
      `mutation UpdateEmployee($id: Int!, $input: UpdateEmployeeInput!) {
        updateEmployee(id: $id, input: $input) { ${EMPLOYEE_FIELDS} }
      }`,
      { id, input },
    ).then((d) => d.updateEmployee),

  remove: (id: number) =>
    gql<{ removeEmployee: { id: number; success: boolean } }>(
      `mutation RemoveEmployee($id: Int!) {
        removeEmployee(id: $id) { id success }
      }`,
      { id },
    ),
};
