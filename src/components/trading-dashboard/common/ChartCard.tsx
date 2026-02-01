"use client";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <div className="border rounded p-3 bg-white h-100">
    <div className="mb-3">
      <h5 className="mb-1">{title}</h5>
      {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
    </div>
    <div style={{ minHeight: 240 }}>{children}</div>
  </div>
);

export default ChartCard;
