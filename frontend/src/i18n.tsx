import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import "dayjs/locale/en";

export type Lang = "th" | "en";

const en = {
  // app shell
  "app.name": "Employee System",
  "app.footer": "Employee Records System",
  "nav.employees": "Employees",
  "nav.departments": "Departments",

  // shared
  "common.search": "Search",
  "common.reset": "Reset",
  "common.save": "Save",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.add": "Add",
  "common.required": "Required",
  "common.code": "Code",
  "common.name": "Name",
  "common.position": "Position",
  "common.department": "Department",
  "common.status": "Status",
  "common.actions": "Actions",
  "common.error": "Something went wrong",
  "status.ACTIVE": "Active",
  "status.RESIGNED": "Resigned",

  // home
  "home.intro":
    "Keep employee records and departments in one place: search people, manage who belongs where, and keep a history of every move.",
  "home.employeesDesc": "Add, edit and search employee records.",
  "home.departmentsDesc": "Manage departments, heads and members.",
  "home.openEmployees": "Open employees",
  "home.openDepartments": "Open departments",

  // employees page
  "emp.subtitle": "Manage employee records, positions and status",
  "emp.namePlaceholder": "First or last name",
  "emp.count": "{n} employees",
  "emp.add": "Add employee",
  "emp.edit": "Edit employee",
  "emp.deleteConfirm": "Delete this employee?",
  "emp.deleted": "Employee deleted",
  "emp.created": "Employee created",
  "emp.updated": "Employee updated",
  "emp.gender": "Gender",
  "emp.birthDate": "Birth date",
  "emp.startDate": "Start date",
  "emp.salary": "Salary",
  "emp.code": "Employee code",
  "emp.codeAuto": "Generated automatically",
  "emp.createdWithCode": "Employee {code} created",
  "emp.prefix": "Prefix",
  "emp.firstName": "First name",
  "emp.lastName": "Last name",
  "emp.selectGenderFirst": "Select gender first",
  "emp.noDepartment": "No department",

  // departments page
  "dept.subtitle": "Manage departments, their heads and members",
  "dept.head": "Head",
  "dept.headPlaceholder": "Head's name",
  "dept.location": "Location",
  "dept.employees": "Employees",
  "dept.count": "{n} departments",
  "dept.add": "Add department",
  "dept.edit": "Edit department",
  "dept.members": "Members",
  "dept.deleteConfirm": "Delete this department?",
  "dept.deleted": "Department deleted",
  "dept.created": "Department created",
  "dept.updated": "Department updated",
  "dept.code": "Department code",
  "dept.name": "Department name",
  "dept.locationLabel": "Location / floor",
  "dept.locationPlaceholder": "e.g. Building A, Floor 3",
  "dept.headLabel": "Department head",
  "dept.headHint":
    "Add employees to this department first, then you can choose a head.",

  // members drawer + add employees modal
  "members.title": "Members of {name}",
  "members.add": "Add employees",
  "members.headTag": "Head",
  "members.removeConfirm": "Remove from this department?",
  "members.remove": "Remove",
  "members.removed": "Employee removed from department",
  "addEmp.title": "Add employees to {name}",
  "addEmp.employees": "Employees",
  "addEmp.selectOne": "Select at least one employee",
  "addEmp.transferHint":
    "Employees who are already in another department will be transferred.",
  "addEmp.searchPlaceholder": "Search by name or code",
  "addEmp.nowIn": "now in {name}",
  "addEmp.effectiveDate": "Effective date",
  "addEmp.remark": "Remark",
  "addEmp.added": "{n} employee(s) added",
};

export type MessageKey = keyof typeof en;

const th: Record<MessageKey, string> = {
  "app.name": "ระบบพนักงาน",
  "app.footer": "ระบบจัดการข้อมูลพนักงาน",
  "nav.employees": "พนักงาน",
  "nav.departments": "แผนก",

  "common.search": "ค้นหา",
  "common.reset": "ล้างค่า",
  "common.save": "บันทึก",
  "common.edit": "แก้ไข",
  "common.delete": "ลบ",
  "common.add": "เพิ่ม",
  "common.required": "กรุณากรอกข้อมูล",
  "common.code": "รหัส",
  "common.name": "ชื่อ",
  "common.position": "ตำแหน่ง",
  "common.department": "แผนก",
  "common.status": "สถานะ",
  "common.actions": "จัดการ",
  "common.error": "เกิดข้อผิดพลาด",
  "status.ACTIVE": "ทำงานอยู่",
  "status.RESIGNED": "ลาออก",

  "home.intro":
    "จัดเก็บข้อมูลพนักงานและแผนกไว้ในที่เดียว ค้นหาพนักงาน จัดการสังกัดแผนก และเก็บประวัติการย้ายทุกครั้ง",
  "home.employeesDesc": "เพิ่ม แก้ไข และค้นหาข้อมูลพนักงาน",
  "home.departmentsDesc": "จัดการแผนก หัวหน้าแผนก และสมาชิก",
  "home.openEmployees": "ไปที่หน้าพนักงาน",
  "home.openDepartments": "ไปที่หน้าแผนก",

  "emp.subtitle": "จัดการข้อมูลพนักงาน ตำแหน่ง และสถานะ",
  "emp.namePlaceholder": "ชื่อหรือนามสกุล",
  "emp.count": "พนักงาน {n} คน",
  "emp.add": "เพิ่มพนักงาน",
  "emp.edit": "แก้ไขพนักงาน",
  "emp.deleteConfirm": "ต้องการลบพนักงานคนนี้หรือไม่?",
  "emp.deleted": "ลบพนักงานแล้ว",
  "emp.created": "เพิ่มพนักงานแล้ว",
  "emp.updated": "แก้ไขข้อมูลพนักงานแล้ว",
  "emp.gender": "เพศ",
  "emp.birthDate": "วันเกิด",
  "emp.startDate": "วันเริ่มงาน",
  "emp.salary": "เงินเดือน",
  "emp.code": "รหัสพนักงาน",
  "emp.codeAuto": "สร้างอัตโนมัติ",
  "emp.createdWithCode": "เพิ่มพนักงาน {code} แล้ว",
  "emp.prefix": "คำนำหน้า",
  "emp.firstName": "ชื่อ",
  "emp.lastName": "นามสกุล",
  "emp.selectGenderFirst": "กรุณาเลือกเพศก่อน",
  "emp.noDepartment": "ไม่มีแผนก",

  "dept.subtitle": "จัดการแผนก หัวหน้าแผนก และสมาชิก",
  "dept.head": "หัวหน้า",
  "dept.headPlaceholder": "ชื่อหัวหน้าแผนก",
  "dept.location": "สถานที่",
  "dept.employees": "พนักงาน",
  "dept.count": "{n} แผนก",
  "dept.add": "เพิ่มแผนก",
  "dept.edit": "แก้ไขแผนก",
  "dept.members": "สมาชิก",
  "dept.deleteConfirm": "ต้องการลบแผนกนี้หรือไม่?",
  "dept.deleted": "ลบแผนกแล้ว",
  "dept.created": "เพิ่มแผนกแล้ว",
  "dept.updated": "แก้ไขแผนกแล้ว",
  "dept.code": "รหัสแผนก",
  "dept.name": "ชื่อแผนก",
  "dept.locationLabel": "สถานที่ / ชั้น",
  "dept.locationPlaceholder": "เช่น อาคาร A ชั้น 3",
  "dept.headLabel": "หัวหน้าแผนก",
  "dept.headHint": "เพิ่มพนักงานเข้าแผนกนี้ก่อน จึงจะเลือกหัวหน้าแผนกได้",

  "members.title": "สมาชิกของ{name}",
  "members.add": "เพิ่มพนักงาน",
  "members.headTag": "หัวหน้า",
  "members.removeConfirm": "ต้องการนำออกจากแผนกนี้หรือไม่?",
  "members.remove": "นำออก",
  "members.removed": "นำพนักงานออกจากแผนกแล้ว",
  "addEmp.title": "เพิ่มพนักงานเข้า{name}",
  "addEmp.employees": "พนักงาน",
  "addEmp.selectOne": "กรุณาเลือกพนักงานอย่างน้อย 1 คน",
  "addEmp.transferHint": "พนักงานที่อยู่แผนกอื่นจะถูกย้ายมาที่แผนกนี้",
  "addEmp.searchPlaceholder": "ค้นหาด้วยชื่อหรือรหัส",
  "addEmp.nowIn": "ปัจจุบันอยู่{name}",
  "addEmp.effectiveDate": "วันที่มีผล",
  "addEmp.remark": "หมายเหตุ",
  "addEmp.added": "เพิ่มพนักงาน {n} คนแล้ว",
};

const messages: Record<Lang, Record<MessageKey, string>> = { en, th };

const STORAGE_KEY = "lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "th" || saved === "en") return saved;
  } catch {
    // storage can be blocked; fall back to the default
  }
  return "th";
}

type Translate = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const l = initialLang();
    dayjs.locale(l);
    document.documentElement.lang = l;
    return l;
  });

  const setLang = useCallback((l: Lang) => {
    dayjs.locale(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore: the choice just won't be remembered
    }
    setLangState(l);
  }, []);

  const t = useCallback<Translate>(
    (key, vars) =>
      messages[lang][key].replace(/\{(\w+)\}/g, (_, v: string) =>
        String(vars?.[v] ?? ""),
      ),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
