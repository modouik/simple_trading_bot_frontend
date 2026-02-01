"use client";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
    <div>
      <h2 className="mb-1">{title}</h2>
      {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
    </div>
    {actions ? <div className="d-flex gap-2 mt-3 mt-md-0">{actions}</div> : null}
  </div>
);

export default PageHeader;
