import type { ThemeConfig } from "antd";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#4f46e5",
    borderRadius: 10,
    fontFamily: "'Inter', 'Noto Sans Thai', system-ui, sans-serif",
    colorBgLayout: "#f5f6fa",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      headerPadding: "0 24px",
      footerBg: "transparent",
    },
    Table: { headerBg: "#f3f4fb" },
  },
};
