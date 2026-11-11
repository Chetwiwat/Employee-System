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
  Space,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import type { DepartmentQuery } from "../api/departments";
import DepartmentFormModal from "../components/DepartmentFormModal";
import DepartmentMembersDrawer from "../components/DepartmentMembersDrawer";
import { columnSortOrder, fullName, toSort } from "../utils";
import type { DepartmentDetail, Paged } from "../types";
import PageHeader from "../components/PageHeader";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
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
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
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
      message.success(t("dept.deleted"));
      reload();
    } catch (e) {
      message.error(errorMessage(e)); // e.g. "Remove all employees from this department first"
    }
  };

  const columns: TableColumnsType<DepartmentDetail> = [
    {
      title: t("common.code"),
      dataIndex: "departmentCode",
      width: 120,
      key: "code",
      sorter: true,
      sortOrder: columnSortOrder("code", query),
    },
    {
      title: t("common.name"),
      dataIndex: "departmentName",
      key: "name",
      sorter: true,
      sortOrder: columnSortOrder("name", query),
    },
    {
      title: t("dept.head"),
      render: (_, r) => (r.head ? fullName(r.head) : "-"),
    },
    {
      title: t("dept.location"),
      dataIndex: "location",
      render: (v: string | null) => v ?? "-",
    },
    {
      title: t("dept.employees"),
      dataIndex: "employeeCount",
      width: 130,
      align: "right",
      key: "employeeCount",
      sorter: true,
      sortOrder: columnSortOrder("employeeCount", query),
    },
    {
      title: t("common.actions"),
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
            {t("dept.members")}
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditing(r);
              setModalOpen(true);
            }}
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("dept.deleteConfirm")}
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
      <PageHeader title={t("nav.departments")} subtitle={t("dept.subtitle")} />

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
            <Col xs={24} sm={16} lg={7}>
              <Form.Item name="name" label={t("common.name")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={7}>
              <Form.Item name="head" label={t("dept.head")}>
                <Input allowClear placeholder={t("dept.headPlaceholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={7}>
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
        title={t("dept.count", { n: data.total })}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            {t("dept.add")}
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
          }}
          onChange={(p, _filters, sorter, { action }) =>
            setQuery((q) => ({
              ...q,
              ...toSort<NonNullable<DepartmentQuery["sortBy"]>>(sorter),
              // a new sort order starts again from page 1
              page: action === "sort" ? 1 : (p.current ?? 1),
              pageSize: p.pageSize ?? q.pageSize,
            }))
          }
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
