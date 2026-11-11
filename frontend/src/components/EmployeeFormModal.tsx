import { useEffect, useState } from "react";
import {
  App,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import { employeeApi } from "../api/employees";
import { masterApi } from "../api/master";
import { useI18n } from "../i18n";
import type { Department, Employee, Gender, Position, Prefix } from "../types";

interface FormValues {
  employeeCode?: string; // display only: the server assigns it
  genderId: number;
  prefixId: number;
  firstName: string;
  lastName: string;
  birthDate: Dayjs;
  positionId: number;
  salary?: number;
  startDate: Dayjs;
  status: "ACTIVE" | "RESIGNED";
  departmentId?: number;
}

interface Props {
  open: boolean;
  editing: Employee | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EmployeeFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: Props) {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const genderId = Form.useWatch("genderId", form);

  // load dropdown data once
  useEffect(() => {
    Promise.all([
      masterApi.genders(),
      masterApi.positions(),
      masterApi.prefixes(),
    ])
      .then(([g, p, x]) => {
        setGenders(g);
        setPositions(p);
        setPrefixes(x);
      })
      .catch((e) => message.error(errorMessage(e)));
  }, [message]);

  // reload departments on open, since they can change while the page is open
  useEffect(() => {
    if (!open) return;
    departmentApi
      .list({ page: 1, pageSize: 100 })
      .then((r) => setDepartments(r.items))
      .catch((e) => message.error(errorMessage(e)));
  }, [open, message]);

  // fill or reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        employeeCode: editing.employeeCode,
        genderId: editing.genderId,
        prefixId: editing.prefixId,
        firstName: editing.firstName,
        lastName: editing.lastName,
        birthDate: dayjs(editing.birthDate),
        positionId: editing.positionId,
        salary: Number(editing.salary),
        startDate: dayjs(editing.startDate),
        status: editing.status,
        departmentId: editing.departmentId ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "ACTIVE" });
      // show the code this employee will most likely get; the server
      // assigns the real one when saving
      employeeApi
        .nextCode()
        .then((code) => form.setFieldValue("employeeCode", code))
        .catch(() => undefined); // the preview is optional
    }
  }, [open, editing, form]);

  const handleOk = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return; // validation messages are already shown on the fields
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { employeeCode: _code, ...fields } = values; // never sent
    const payload = {
      ...fields,
      birthDate: values.birthDate.format("YYYY-MM-DD"),
      startDate: values.startDate.format("YYYY-MM-DD"),
      departmentId: values.departmentId ?? null,
    };

    setSaving(true);
    try {
      if (editing) {
        await employeeApi.update(editing.id, payload);
        message.success(t("emp.updated"));
      } else {
        const created = await employeeApi.create(payload);
        message.success(
          t("emp.createdWithCode", { code: created.employeeCode }),
        );
      }
      onSaved();
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const prefixOptions = prefixes
    .filter((p) => p.genderId === null || p.genderId === genderId)
    .map((p) => ({ value: p.id, label: p.prefixName }));

  return (
    <Modal
      title={editing ? t("emp.edit") : t("emp.add")}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText={t("common.save")}
      width={640}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="employeeCode"
          label={t("emp.code")}
          extra={editing ? undefined : t("emp.codeAuto")}
        >
          <Input disabled />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="genderId"
              label={t("emp.gender")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select
                options={genders.map((g) => ({
                  value: g.id,
                  label: g.genderName,
                }))}
                onChange={() => form.setFieldValue("prefixId", undefined)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="prefixId"
              label={t("emp.prefix")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select
                options={prefixOptions}
                disabled={!genderId}
                placeholder={t("emp.selectGenderFirst")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label={t("emp.firstName")}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("common.required"),
                },
                { max: 100 },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label={t("emp.lastName")}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("common.required"),
                },
                { max: 100 },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="birthDate"
              label={t("emp.birthDate")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={(d) => d.isAfter(dayjs())}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label={t("emp.startDate")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="positionId"
              label={t("common.position")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select
                options={positions.map((p) => ({
                  value: p.id,
                  label: p.positionName,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="departmentId" label={t("common.department")}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder={t("emp.noDepartment")}
                options={departments.map((d) => ({
                  value: d.id,
                  label: `${d.departmentCode} - ${d.departmentName}`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="salary" label={t("emp.salary")}>
              <InputNumber<number>
                min={0}
                precision={2}
                style={{ width: "100%" }}
                // show 50000 as 50,000.00; strip commas back out when saving
                formatter={(v) =>
                  `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => Number((v ?? "").replace(/,/g, ""))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label={t("common.status")}>
              <Select
                options={[
                  { value: "ACTIVE", label: t("status.ACTIVE") },
                  { value: "RESIGNED", label: t("status.RESIGNED") },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
