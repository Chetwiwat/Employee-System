import { App as AntApp, ConfigProvider, Layout, Menu } from "antd";
import { ApartmentOutlined, TeamOutlined } from "@ant-design/icons";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import DepartmentsPage from "./pages/DepartmentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import HomePage from "./pages/HomePage";
import { appTheme } from "./theme";

function Shell() {
  const { pathname } = useLocation();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-logo">
            <TeamOutlined />
          </span>
          Employee System
        </Link>
        <Menu
          mode="horizontal"
          className="app-menu"
          selectedKeys={[pathname]}
          items={[
            {
              key: "/employees",
              icon: <TeamOutlined />,
              label: <Link to="/employees">Employees</Link>,
            },
            {
              key: "/departments",
              icon: <ApartmentOutlined />,
              label: <Link to="/departments">Departments</Link>,
            },
          ]}
        />
      </Layout.Header>

      <Layout.Content>
        <div className="page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Layout.Content>

      <Layout.Footer className="app-footer">
        Employee Records System
      </Layout.Footer>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <AntApp>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
