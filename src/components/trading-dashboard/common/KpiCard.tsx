"use client";

type KpiCardProps = {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
};

const KpiCard = ({ label, value, hint }: KpiCardProps) => (
  <div className="border rounded p-3 h-100 bg-white">
    <p className="text-muted mb-1">{label}</p>
    <h4 className="mb-1">{value ?? "--"}</h4>
    {hint ? <small className="text-muted">{hint}</small> : null}
  </div>
);

export default KpiCard;
