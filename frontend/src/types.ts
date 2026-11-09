export interface Gender {
  id: number;
  genderCode: string;
  genderName: string;
}
export interface Position {
  id: number;
  positionName: string;
}
export interface Prefix {
  id: number;
  prefixName: string;
  genderId: number | null;
}
export interface Department {
  id: number;
  departmentCode: string;
  departmentName: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  prefixId: number;
  firstName: string;
  lastName: string;
  genderId: number;
  birthDate: string;
  positionId: number;
  salary: string;
  startDate: string;
  status: "ACTIVE" | "RESIGNED";
  departmentId: number | null;
  prefix: Prefix;
  gender: Gender;
  position: Position;
  department: Department | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DepartmentDetail extends Department {
  headEmployeeId: number | null;
  head: Pick<Employee, "id" | "employeeCode" | "firstName" | "lastName"> | null;
  location: string | null;
  employeeCount?: number;
}
