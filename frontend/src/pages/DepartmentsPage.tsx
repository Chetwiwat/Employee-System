import { useEffect, useState } from "react";
import { App, Button, Card, Form, Input, Popconfirm, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import type { DepartmentQuery } from "../api/departments";
import DepartmentFormModal from "../components/DepartmentFormModal";
import DepartmentMembersDrawer from "../components/DepartmentMembersDrawer";
import { fullName } from "../utils";
import type { DepartmentDetail, Paged } from "../types";
import PageHeader from "../components/PageHeader";

interface SearchValues {
  code?: string;
  name?: string;
  head?: string;
}

const EMPTY: Paged<DepartmentDetail> = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

export default function DepartmentsPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<SearchValues>();

  const [query, setQuery] = useState<DepartmentQuery>({
    page: 1,
    pageSize: 10,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: Paged<DepartmentDetail>;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentDetail | null>(null);
  const [membersFor, setMembersFor] = useState<DepartmentDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const requestKey = `${JSON.stringify(query)}#${reloadKey}`;
  const loading = result?.key !== requestKey;
  const data = result?.data ?? EMPTY;

  useEffect(() => {
    let cancelled = false;
    departmentApi
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
        setResult((prev) => ({ key: requestKey, data: prev?.data ?? EMPTY }));
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestKey, message]);

  const reload = () => setReloadKey((k) => k + 1);

  // keep the drawer's department fresh (head and counts change while it is open)
  const drawerDept = membersFor
    ? (data.items.find((d) => d.id === membersFor.id) ?? membersFor)
    : null;

  const handleSearch = (v: SearchValues) => {
    setQuery((q) => ({
      page: 1,
      pageSize: q.pageSize,
      code: v.code?.trim() || undefined,
      name: v.name?.trim() || undefined,
      head: v.head?.trim() || undefined,
    }));
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery((q) => ({ page: 1, pageSize: q.pageSize }));
  };

  const handleDelete = async (id: number) => {
    try {
      await departmentApi.remove(id);
      message.success("Department deleted");
      reload();
    } catch (e) {
      message.error(errorMessage(e)); // e.g. "Remove all employees from this department first"
    }
  };

  const columns: TableColumnsType<DepartmentDetail> = [
    { title: "Code", dataIndex: "departmentCode", width: 120 },
    { title: "Name", dataIndex: "departmentName" },
    { title: "Head", render: (_, r) => (r.head ? fullName(r.head) : "-") },
    {
      title: "Location",
      dataIndex: "location",
      render: (v: string | null) => v ?? "-",
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      width: 110,
      align: "right",
    },
    {
      title: "Actions",
      width: 230,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setMembersFor(r);
              setDrawerOpen(true);
            }}
          >
            Members
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditing(r);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this department?"
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
        title="Departments"
        subtitle="Manage departments, their heads and members"
      />

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="code" label="Code">
            <Input allowClear />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input allowClear />
          </Form.Item>
          <Form.Item name="head" label="Head">
            <Input allowClear placeholder="Head's name" />
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
        title={`${data.total} departments`}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add department
          </Button>
        }
      >
        <Table<DepartmentDetail>
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

      <DepartmentFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          reload();
        }}
      />

      <DepartmentMembersDrawer
        open={drawerOpen}
        department={drawerDept}
        onClose={() => setDrawerOpen(false)}
        onChanged={reload}
      />
    </div>
  );
}
