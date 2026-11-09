import { useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { errorMessage } from "../api/client";
import { employeeApi } from "../api/employees";
import type { EmployeeQuery } from "../api/employees";
import { masterApi } from "../api/master";
import EmployeeFormModal from "../components/EmployeeFormModal";
import type { Employee, Paged, Position } from "../types";
import PageHeader from "../components/PageHeader";

interface SearchValues {
  code?: string;
  name?: string;
  positionId?: number;
}

const EMPTY: Paged<Employee> = { items: [], total: 0, page: 1, pageSize: 10 };

export default function EmployeesPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<SearchValues>();

  const [query, setQuery] = useState<EmployeeQuery>({ page: 1, pageSize: 10 });
  const [reloadKey, setReloadKey] = useState(0); // bump this to force a refetch
  const [result, setResult] = useState<{
    key: string;
    data: Paged<Employee>;
  } | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  // identifies "the request we want right now"
  const requestKey = `${JSON.stringify(query)}#${reloadKey}`;
  const loading = result?.key !== requestKey; // still waiting for the matching response
  const data = result?.data ?? EMPTY;

  useEffect(() => {
    let cancelled = false;
    employeeApi
      .list(query)
      .then((d) => {
        if (cancelled) return;
        const lastPage = Math.max(1, Math.ceil(d.total / query.pageSize));
        if (query.page > lastPage) {
          setQuery((q) => ({ ...q, page: lastPage }));
          return;
        }
        setResult({ key: requestKey, data: d });
      })
      .catch((e) => {
        if (cancelled) return;
        message.error(errorMessage(e));
        // mark this request as finished, keep whatever was on screen
        setResult((prev) => ({ key: requestKey, data: prev?.data ?? EMPTY }));
      });
    return () => {
      cancelled = true; // ignore responses from outdated requests
    };
  }, [query, requestKey, message]);

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    masterApi
      .positions()
      .then(setPositions)
      .catch((e) => message.error(errorMessage(e)));
  }, [message]);

  const handleSearch = (v: SearchValues) => {
    setQuery((q) => ({
      page: 1,
      pageSize: q.pageSize,
      code: v.code?.trim() || undefined,
      name: v.name?.trim() || undefined,
      positionId: v.positionId,
    }));
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery((q) => ({ page: 1, pageSize: q.pageSize }));
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeApi.remove(id);
      message.success("Employee deleted");
      reload();
    } catch (e) {
      message.error(errorMessage(e));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Employee) => {
    setEditing(row);
    setModalOpen(true);
  };

  const columns: TableColumnsType<Employee> = [
    { title: "Code", dataIndex: "employeeCode", width: 110 },
    {
      title: "Name",
      render: (_, r) =>
        `${r.prefix?.prefixName ?? ""} ${r.firstName} ${r.lastName}`,
    },
    { title: "Gender", render: (_, r) => r.gender?.genderName },
    {
      title: "Birth date",
      dataIndex: "birthDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    { title: "Position", render: (_, r) => r.position?.positionName },
    {
      title: "Department",
      render: (_, r) => r.department?.departmentName ?? "-",
    },
    {
      title: "Start date",
      dataIndex: "startDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: Employee["status"]) => (
        <Tag color={s === "ACTIVE" ? "green" : "default"}>{s}</Tag>
      ),
    },
    {
      title: "Actions",
      width: 150,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this employee?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage employee records, positions and status"
      />

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="code" label="Code">
            <Input allowClear />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input allowClear placeholder="First or last name" />
          </Form.Item>
          <Form.Item name="positionId" label="Position">
            <Select
              allowClear
              style={{ width: 200 }}
              options={positions.map((p) => ({
                value: p.id,
                label: p.positionName,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`${data.total} employees`}
        extra={
          <Button type="primary" onClick={openAdd}>
            Add employee
          </Button>
        }
      >
        <Table<Employee>
          rowKey="id"
          columns={columns}
          dataSource={data.items}
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total: data.total,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setQuery((q) => ({ ...q, page, pageSize })),
          }}
        />
      </Card>

      <EmployeeFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          reload();
        }}
      />
    </div>
  );
}
