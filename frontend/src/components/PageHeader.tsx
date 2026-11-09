import { Typography } from "antd";

interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="page-header">
      <Typography.Title level={2} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {subtitle && (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      )}
    </div>
  );
}
