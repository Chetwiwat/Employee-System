import { api } from "./client";
import type { Employee, Paged } from "../types";

export interface EmployeeQuery {
  code?: string;
  name?: string;
  positionId?: number;
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
}

export const employeeApi = {
  list: (params: EmployeeQuery) =>
    api.get<Paged<Employee>>("/employees", { params }).then((r) => r.data),
  create: (data: EmployeePayload) =>
    api.post<Employee>("/employees", data).then((r) => r.data),
  update: (id: number, data: Partial<EmployeePayload>) =>
    api.patch<Employee>(`/employees/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/employees/${id}`),
};
