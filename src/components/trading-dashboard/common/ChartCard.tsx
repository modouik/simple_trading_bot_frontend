"use client";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <div className="app-theme-card rounded-3 p-3 h-100">
    <div className="mb-3">
      <h5 className="mb-1" style={{ color: "var(--app-text)" }}>{title}</h5>
      {subtitle ? <p className="mb-0" style={{ color: "var(--app-text-muted)", fontSize: "0.9rem" }}>{subtitle}</p> : null}
    </div>
    <div style={{ minHeight: 240 }}>{children}</div>
  </div>
);

export default ChartCard;
