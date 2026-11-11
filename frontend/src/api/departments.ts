import { gql } from "./client";
import { EMPLOYEE_FIELDS } from "./employees";
import type { DepartmentDetail, Employee, Paged } from "../types";

export interface DepartmentQuery {
  code?: string;
  name?: string;
  head?: string;
  sortBy?: "code" | "name" | "employeeCount";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface DepartmentPayload {
  departmentCode: string;
  departmentName: string;
  location: string | null;
  headEmployeeId?: number | null;
}

export interface AddEmployeesPayload {
  employeeIds: number[];
  effectiveDate?: string;
  remark?: string;
}

const DEPARTMENT_FIELDS = `
  id departmentCode departmentName location headEmployeeId employeeCount
  head { id employeeCode firstName lastName }
`;

// Members are loaded without their department (they are all in this one)
const MEMBER_FIELDS = EMPLOYEE_FIELDS.replace(
  "department { id departmentCode departmentName }",
  "",
);

export const departmentApi = {
  list: (query: DepartmentQuery) =>
    gql<{ departments: Paged<DepartmentDetail> }>(
      `query Departments($query: DepartmentQueryInput) {
        departments(query: $query) {
          total page pageSize
          items { ${DEPARTMENT_FIELDS} }
        }
      }`,
      { query },
    ).then((d) => d.departments),

  create: (input: DepartmentPayload) =>
    gql<{ createDepartment: DepartmentDetail }>(
      `mutation CreateDepartment($input: CreateDepartmentInput!) {
        createDepartment(input: $input) { ${DEPARTMENT_FIELDS} }
      }`,
      { input },
    ).then((d) => d.createDepartment),

  update: (id: number, input: Partial<DepartmentPayload>) =>
    gql<{ updateDepartment: DepartmentDetail }>(
      `mutation UpdateDepartment($id: Int!, $input: UpdateDepartmentInput!) {
        updateDepartment(id: $id, input: $input) { ${DEPARTMENT_FIELDS} }
      }`,
      { id, input },
    ).then((d) => d.updateDepartment),

  remove: (id: number) =>
    gql(
      `mutation RemoveDepartment($id: Int!) {
        removeDepartment(id: $id) { id success }
      }`,
      { id },
    ),

  members: (id: number) =>
    gql<{ departmentMembers: Employee[] }>(
      `query DepartmentMembers($id: Int!) {
        departmentMembers(id: $id) { ${MEMBER_FIELDS} }
      }`,
      { id },
    ).then((d) => d.departmentMembers),

  addEmployees: (id: number, input: AddEmployeesPayload) =>
    gql<{ addEmployeesToDepartment: Employee[] }>(
      `mutation AddEmployees($id: Int!, $input: AddEmployeesInput!) {
        addEmployeesToDepartment(id: $id, input: $input) { ${MEMBER_FIELDS} }
      }`,
      { id, input },
    ).then((d) => d.addEmployeesToDepartment),

  removeEmployee: (id: number, employeeId: number) =>
    gql(
      `mutation RemoveEmployeeFromDepartment($id: Int!, $employeeId: Int!) {
        removeEmployeeFromDepartment(id: $id, employeeId: $employeeId) {
          id success
        }
      }`,
      { id, employeeId },
    ),
};
