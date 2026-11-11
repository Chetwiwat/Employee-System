import { useEffect, useState } from "react";
import { App, Form, Input, Modal, Select } from "antd";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import { useI18n } from "../i18n";
import { fullName } from "../utils";
import type { DepartmentDetail, Employee } from "../types";

interface FormValues {
  departmentCode: string;
  departmentName: string;
  location?: string;
  headEmployeeId?: number;
}

interface Props {
  open: boolean;
  editing: DepartmentDetail | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DepartmentFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<{
    deptId: number;
    items: Employee[];
  } | null>(null);

  // fill or reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        departmentCode: editing.departmentCode,
        departmentName: editing.departmentName,
        location: editing.location ?? undefined,
        headEmployeeId: editing.headEmployeeId ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, editing, form]);

  // load this department's members for the head dropdown
  useEffect(() => {
    if (!open || !editing) return;
    let cancelled = false;
    departmentApi
      .members(editing.id)
      .then((items) => {
        if (!cancelled) setMembers({ deptId: editing.id, items });
      })
      .catch((e) => {
        if (!cancelled) message.error(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [open, editing, message]);

  const memberItems =
    editing && members?.deptId === editing.id ? members.items : [];
  const headOptions = memberItems.map((m) => ({
    value: m.id,
    label: `${m.employeeCode} · ${fullName(m)}`,
  }));
  // show the current head's name right away, before the member list arrives
  if (editing?.head && !headOptions.some((o) => o.value === editing.head!.id)) {
    headOptions.push({
      value: editing.head.id,
      label: `${editing.head.employeeCode} · ${fullName(editing.head)}`,
    });
  }

  const handleOk = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload = {
      departmentCode: values.departmentCode.trim(),
      departmentName: values.departmentName.trim(),
      location: values.location?.trim() || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await departmentApi.update(editing.id, {
          ...payload,
          headEmployeeId: values.headEmployeeId ?? null, // null clears the head
        });
        message.success(t("dept.updated"));
      } else {
        await departmentApi.create(payload);
        message.success(t("dept.created"));
      }
      onSaved();
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? t("dept.edit") : t("dept.add")}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={t("common.save")}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="departmentCode"
          label={t("dept.code")}
          rules={[
            { required: true, whitespace: true, message: t("common.required") },
            { max: 20 },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="departmentName"
          label={t("dept.name")}
          rules={[
            { required: true, whitespace: true, message: t("common.required") },
            { max: 150 },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="location"
          label={t("dept.locationLabel")}
          rules={[{ max: 100 }]}
        >
          <Input placeholder={t("dept.locationPlaceholder")} />
        </Form.Item>

        {editing && (
          <Form.Item
            name="headEmployeeId"
            label={t("dept.headLabel")}
            extra={memberItems.length === 0 ? t("dept.headHint") : undefined}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={headOptions}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
