import { useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import { employeeApi } from "../api/employees";
import type { EmployeeQuery, EmployeeSortKey } from "../api/employees";
import { masterApi } from "../api/master";
import EmployeeFormModal from "../components/EmployeeFormModal";
import type { Department, Employee, Paged, Position } from "../types";
import PageHeader from "../components/PageHeader";
import { useI18n } from "../i18n";
import { columnSortOrder, toSort } from "../utils";

interface SearchValues {
  code?: string;
  name?: string;
  positionId?: number;
  departmentId?: number;
}

const EMPTY: Paged<Employee> = { items: [], total: 0, page: 1, pageSize: 10 };

export default function EmployeesPage() {
  const { message } = App.useApp();
  const { t } = useI18n();
  const [searchForm] = Form.useForm<SearchValues>();

  const [query, setQuery] = useState<EmployeeQuery>({ page: 1, pageSize: 10 });
  const [reloadKey, setReloadKey] = useState(0); // bump this to force a refetch
  const [result, setResult] = useState<{
    key: string;
    data: Paged<Employee>;
  } | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
    departmentApi
      .list({ page: 1, pageSize: 100 })
      .then((r) => setDepartments(r.items))
      .catch((e) => message.error(errorMessage(e)));
  }, [message]);

  const handleSearch = (v: SearchValues) => {
    setQuery((q) => ({
      page: 1,
      pageSize: q.pageSize,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      code: v.code?.trim() || undefined,
      name: v.name?.trim() || undefined,
      positionId: v.positionId,
      departmentId: v.departmentId,
    }));
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery((q) => ({ page: 1, pageSize: q.pageSize }));
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeApi.remove(id);
      message.success(t("emp.deleted"));
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
    {
      title: t("common.code"),
      dataIndex: "employeeCode",
      width: 110,
      key: "code",
      sorter: true,
      sortOrder: columnSortOrder("code", query),
    },
    {
      title: t("common.name"),
      key: "name",
      sorter: true,
      sortOrder: columnSortOrder("name", query),
      render: (_, r) =>
        `${r.prefix?.prefixName ?? ""} ${r.firstName} ${r.lastName}`,
    },
    { title: t("emp.gender"), render: (_, r) => r.gender?.genderName },
    {
      title: t("emp.birthDate"),
      dataIndex: "birthDate",
      key: "birthDate",
      sorter: true,
      sortOrder: columnSortOrder("birthDate", query),
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    { title: t("common.position"), render: (_, r) => r.position?.positionName },
    {
      title: t("common.department"),
      render: (_, r) => r.department?.departmentName ?? "-",
    },
    {
      title: t("emp.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      sorter: true,
      sortOrder: columnSortOrder("startDate", query),
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: t("emp.salary"),
      dataIndex: "salary",
      align: "right",
      key: "salary",
      sorter: true,
      sortOrder: columnSortOrder("salary", query),
      render: (v: string) =>
        Number(v).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder: columnSortOrder("status", query),
      render: (s: Employee["status"]) => (
        <Tag color={s === "ACTIVE" ? "green" : "default"}>
          {t(`status.${s}` as const)}
        </Tag>
      ),
    },
    {
      title: t("common.actions"),
      width: 150,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("emp.deleteConfirm")}
            okText={t("common.delete")}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger>
              {t("common.delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("nav.employees")} subtitle={t("emp.subtitle")} />

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="vertical"
          className="filter-form"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8} lg={3}>
              <Form.Item name="code" label={t("common.code")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16} lg={5}>
              <Form.Item name="name" label={t("common.name")}>
                <Input allowClear placeholder={t("emp.namePlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Form.Item name="positionId" label={t("common.position")}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={positions.map((p) => ({
                    value: p.id,
                    label: p.positionName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Form.Item name="departmentId" label={t("common.department")}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.departmentName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={6}>
              {/* empty label keeps the buttons level with the inputs */}
              <Form.Item label=" " colon={false}>
                <div className="filter-actions">
                  <Button onClick={handleReset}>{t("common.reset")}</Button>
                  <Button type="primary" htmlType="submit">
                    {t("common.search")}
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={t("emp.count", { n: data.total })}
        extra={
          <Button type="primary" onClick={openAdd}>
            {t("emp.add")}
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
          }}
          onChange={(p, _filters, sorter, { action }) =>
            setQuery((q) => ({
              ...q,
              ...toSort<EmployeeSortKey>(sorter),
              // a new sort order starts again from page 1
              page: action === "sort" ? 1 : (p.current ?? 1),
              pageSize: p.pageSize ?? q.pageSize,
            }))
          }
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
