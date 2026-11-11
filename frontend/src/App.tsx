import { App as AntApp, ConfigProvider, Layout, Menu, Segmented } from "antd";
import enUS from "antd/locale/en_US";
import thTH from "antd/locale/th_TH";
import { ApartmentOutlined, TeamOutlined } from "@ant-design/icons";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { I18nProvider, useI18n } from "./i18n";
import type { Lang } from "./i18n";
import DepartmentsPage from "./pages/DepartmentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import HomePage from "./pages/HomePage";
import { appTheme } from "./theme";

function Shell() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-logo">
            <TeamOutlined />
          </span>
          {t("app.name")}
        </Link>
        <Menu
          mode="horizontal"
          className="app-menu"
          selectedKeys={[pathname]}
          items={[
            {
              key: "/employees",
              icon: <TeamOutlined />,
              label: <Link to="/employees">{t("nav.employees")}</Link>,
            },
            {
              key: "/departments",
              icon: <ApartmentOutlined />,
              label: <Link to="/departments">{t("nav.departments")}</Link>,
            },
          ]}
        />
        <Segmented<Lang>
          aria-label="Language"
          value={lang}
          onChange={setLang}
          options={[
            { value: "th", label: "TH" },
            { value: "en", label: "EN" },
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

      <Layout.Footer className="app-footer">{t("app.footer")}</Layout.Footer>
    </Layout>
  );
}

function Themed() {
  const { lang } = useI18n();
  return (
    <ConfigProvider theme={appTheme} locale={lang === "th" ? thTH : enUS}>
      <AntApp>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Themed />
    </I18nProvider>
  );
}
