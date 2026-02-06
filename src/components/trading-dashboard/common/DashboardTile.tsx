"use client";

import { ReactNode } from "react";
import { formatNumber } from "@/utils/numberFormat";

export type DashboardTileProps = {
  label: string;
  value: string | number | null | undefined;
  icon?: ReactNode;
};

const DashboardTile = ({ label, value, icon }: DashboardTileProps) => {
  let display: string | number = value ?? "--";

  if (typeof value === "number") {
    display = Number.isInteger(value) ? value : formatNumber(value, 8);
  } else if (typeof value === "string") {
    const num = Number(value);
    if (!Number.isNaN(num) && !Number.isInteger(num)) {
      display = formatNumber(num, 8);
    }
  }

  return (
    <div className="card-tiles app-theme-card app-theme-card-tile">
      <div>
        <h6>{label}</h6>
        <h3>{display}</h3>
      </div>
      {icon ? <div className="icon-box app-theme-tile-icon">{icon}</div> : null}
    </div>
  );
};

export default DashboardTile;
