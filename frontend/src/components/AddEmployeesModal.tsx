import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { App, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import { employeeApi } from "../api/employees";
import { useI18n } from "../i18n";
import { fullName } from "../utils";
import type { DepartmentDetail, Employee } from "../types";

// search by name and by code in parallel, then merge the results
async function searchEmployees(term: string): Promise<Employee[]> {
  const t = term.trim();
  const base = { page: 1, pageSize: 20 };
  const requests = t
    ? [
        employeeApi.list({ ...base, name: t }),
        employeeApi.list({ ...base, code: t }),
      ]
    : [employeeApi.list(base)];
  const pages = await Promise.all(requests);
  const map = new Map<number, Employee>();
  pages.flatMap((p) => p.items).forEach((e) => map.set(e.id, e));
  return [...map.values()];
}

interface FormValues {
  employees: { value: number; label: ReactNode }[];
  effectiveDate: Dayjs;
  remark?: string;
}

interface Props {
  open: boolean;
  department: DepartmentDetail | null;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddEmployeesModal({
  open,
  department,
  onClose,
  onAdded,
}: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [candidates, setCandidates] = useState<Employee[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(0); // ignore responses from outdated searches

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ effectiveDate: dayjs() });

    const id = ++latest.current;
    searchEmployees("")
      .then((list) => {
        if (id === latest.current) setCandidates(list);
      })
      .catch((e) => message.error(errorMessage(e)));

    return () => window.clearTimeout(timer.current);
  }, [open, form, message]);

  const handleSearch = (term: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const id = ++latest.current;
      searchEmployees(term)
        .then((list) => {
          if (id === latest.current) setCandidates(list);
        })
        .catch((e) => message.error(errorMessage(e)));
    }, 300);
  };

  const options = candidates
    .filter((e) => e.departmentId !== department?.id) // already members
    .map((e) => ({
      value: e.id,
      label:
        `${e.employeeCode} · ${fullName(e)}` +
        (e.department
          ? `  (${t("addEmp.nowIn", { name: e.department.departmentName })})`
          : ""),
    }));

  const handleOk = async () => {
    if (!department) return;
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      await departmentApi.addEmployees(department.id, {
        employeeIds: values.employees.map((x) => x.value),
        effectiveDate: values.effectiveDate.format("YYYY-MM-DD"),
        remark: values.remark?.trim() || undefined,
      });
      message.success(t("addEmp.added", { n: values.employees.length }));
      onAdded();
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t("addEmp.title", { name: department?.departmentName ?? "" })}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={t("common.add")}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="employees"
          label={t("addEmp.employees")}
          rules={[{ required: true, message: t("addEmp.selectOne") }]}
          extra={t("addEmp.transferHint")}
        >
          <Select
            mode="multiple"
            labelInValue
            showSearch
            filterOption={false}
            onSearch={handleSearch}
            options={options}
            placeholder={t("addEmp.searchPlaceholder")}
          />
        </Form.Item>
        <Form.Item
          name="effectiveDate"
          label={t("addEmp.effectiveDate")}
          rules={[{ required: true }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="remark"
          label={t("addEmp.remark")}
          rules={[{ max: 255 }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
