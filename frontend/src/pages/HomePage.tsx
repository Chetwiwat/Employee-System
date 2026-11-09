import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { departmentApi } from "../api/departments";
import { employeeApi } from "../api/employees";

interface Totals {
  employees: number | null;
  departments: number | null;
}

export default function HomePage() {
  const [totals, setTotals] = useState<Totals | null>(null); // null = still loading

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      employeeApi.list({ page: 1, pageSize: 1 }),
      departmentApi.list({ page: 1, pageSize: 1 }),
    ])
      .then(([e, d]) => {
        if (!cancelled) setTotals({ employees: e.total, departments: d.total });
      })
      .catch(() => {
        // the numbers are decorative, so show a dash instead of an error toast
        if (!cancelled) setTotals({ employees: null, departments: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = totals === null;

  return (
    <div>
      <section className="hero">
        <h1>Employee System</h1>
        <p>
          Keep employee records and departments in one place: search people,
          manage who belongs where, and keep a history of every move.
        </p>
      </section>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Link to="/employees">
            <Card hoverable className="nav-card">
              <div className="nav-icon">
                <TeamOutlined />
              </div>
              <Statistic
                title="Employees"
                value={totals?.employees ?? "-"}
                loading={loading}
              />
              <Typography.Paragraph
                type="secondary"
                style={{ margin: "12px 0" }}
              >
                Add, edit and search employee records.
              </Typography.Paragraph>
              <Typography.Text strong style={{ color: "#4f46e5" }}>
                Open employees <ArrowRightOutlined />
              </Typography.Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} md={12}>
          <Link to="/departments">
            <Card hoverable className="nav-card">
              <div className="nav-icon">
                <ApartmentOutlined />
              </div>
              <Statistic
                title="Departments"
                value={totals?.departments ?? "-"}
                loading={loading}
              />
              <Typography.Paragraph
                type="secondary"
                style={{ margin: "12px 0" }}
              >
                Manage departments, heads and members.
              </Typography.Paragraph>
              <Typography.Text strong style={{ color: "#4f46e5" }}>
                Open departments <ArrowRightOutlined />
              </Typography.Text>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
