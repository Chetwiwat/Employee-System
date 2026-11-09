import { useEffect, useState } from "react";
import { App, Button, Drawer, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { errorMessage } from "../api/client";
import { departmentApi } from "../api/departments";
import { fullName } from "../utils";
import type { DepartmentDetail, Employee } from "../types";
import AddEmployeesModal from "./AddEmployeesModal";

interface Props {
  open: boolean;
  department: DepartmentDetail | null;
  onClose: () => void;
  onChanged: () => void; // tell the parent page to refresh its counts and head
}

export default function DepartmentMembersDrawer({
  open,
  department,
  onClose,
  onChanged,
}: Props) {
  const { message } = App.useApp();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    deptId: number;
    key: string;
    items: Employee[];
  } | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const deptId = department?.id;
  const requestKey = `${deptId}#${reloadKey}`;
  const loading = open && deptId != null && result?.key !== requestKey;
  const items = result && result.deptId === deptId ? result.items : [];

  useEffect(() => {
    if (!open || deptId == null) return;
    let cancelled = false;
    departmentApi
      .members(deptId)
      .then((list) => {
        if (!cancelled) setResult({ deptId, key: requestKey, items: list });
      })
      .catch((e) => {
        if (cancelled) return;
        message.error(errorMessage(e));
        setResult((prev) => ({
          deptId,
          key: requestKey,
          items: prev?.deptId === deptId ? prev.items : [],
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [open, deptId, requestKey, message]);

  const refresh = () => {
    setReloadKey((k) => k + 1);
    onChanged();
  };

  const handleRemove = async (employeeId: number) => {
    if (!department) return;
    try {
      await departmentApi.removeEmployee(department.id, employeeId);
      message.success("Employee removed from department");
      refresh();
    } catch (e) {
      message.error(errorMessage(e));
    }
  };

  const columns: TableColumnsType<Employee> = [
    { title: "Code", dataIndex: "employeeCode", width: 110 },
    {
      title: "Name",
      render: (_, r) => (
        <>
          {fullName(r)}{" "}
          {r.id === department?.headEmployeeId && <Tag color="blue">Head</Tag>}
        </>
      ),
    },
    { title: "Position", render: (_, r) => r.position?.positionName },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: Employee["status"]) => (
        <Tag color={s === "ACTIVE" ? "green" : "default"}>{s}</Tag>
      ),
    },
    {
      title: "",
      width: 100,
      render: (_, r) => (
        <Popconfirm
          title="Remove from this department?"
          okText="Remove"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleRemove(r.id)}
        >
          <Button size="small" danger>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Drawer
      title={`Members of ${department?.departmentName ?? ""}`}
      open={open}
      onClose={onClose}
      size={760}
      extra={
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add employees
        </Button>
      }
    >
      <Table<Employee>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
      <AddEmployeesModal
        open={addOpen}
        department={department}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setAddOpen(false);
          refresh();
        }}
      />
    </Drawer>
  );
}
