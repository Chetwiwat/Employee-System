import { api } from "./client";
import type { DepartmentDetail, Employee, Paged } from "../types";

export interface DepartmentQuery {
  code?: string;
  name?: string;
  head?: string;
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

export const departmentApi = {
  list: (params: DepartmentQuery) =>
    api
      .get<Paged<DepartmentDetail>>("/departments", { params })
      .then((r) => r.data),
  create: (data: DepartmentPayload) =>
    api.post<DepartmentDetail>("/departments", data).then((r) => r.data),
  update: (id: number, data: Partial<DepartmentPayload>) =>
    api.patch<DepartmentDetail>(`/departments/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/departments/${id}`),

  members: (id: number) =>
    api.get<Employee[]>(`/departments/${id}/employees`).then((r) => r.data),
  addEmployees: (id: number, data: AddEmployeesPayload) =>
    api
      .post<Employee[]>(`/departments/${id}/employees`, data)
      .then((r) => r.data),
  removeEmployee: (id: number, employeeId: number) =>
    api.delete(`/departments/${id}/employees/${employeeId}`),
};
