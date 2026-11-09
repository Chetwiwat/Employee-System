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
import { employeeApi } from "../api/employees";
import { masterApi } from "../api/master";
import type { Employee, Gender, Position, Prefix } from "../types";

interface FormValues {
  employeeCode: string;
  genderId: number;
  prefixId: number;
  firstName: string;
  lastName: string;
  birthDate: Dayjs;
  positionId: number;
  salary?: number;
  startDate: Dayjs;
  status: "ACTIVE" | "RESIGNED";
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
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
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
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "ACTIVE" });
    }
  }, [open, editing, form]);

  const handleOk = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return; // validation messages are already shown on the fields
    }

    const payload = {
      ...values,
      birthDate: values.birthDate.format("YYYY-MM-DD"),
      startDate: values.startDate.format("YYYY-MM-DD"),
    };

    setSaving(true);
    try {
      if (editing) {
        await employeeApi.update(editing.id, payload);
        message.success("Employee updated");
      } else {
        await employeeApi.create(payload);
        message.success("Employee created");
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
      title={editing ? "Edit employee" : "Add employee"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText="Save"
      width={640}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="employeeCode"
          label="Employee code"
          rules={[{ required: true, message: "Required" }, { max: 20 }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="genderId"
              label="Gender"
              rules={[{ required: true, message: "Required" }]}
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
              label="Prefix"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                options={prefixOptions}
                disabled={!genderId}
                placeholder="Select gender first"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First name"
              rules={[
                { required: true, whitespace: true, message: "Required" },
                { max: 100 },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last name"
              rules={[
                { required: true, whitespace: true, message: "Required" },
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
              label="Birth date"
              rules={[{ required: true, message: "Required" }]}
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
              label="Start date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="positionId"
          label="Position"
          rules={[{ required: true, message: "Required" }]}
        >
          <Select
            options={positions.map((p) => ({
              value: p.id,
              label: p.positionName,
            }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="salary" label="Salary">
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "RESIGNED", label: "Resigned" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
