"use client";

import { ReactNode } from "react";

export type DashboardTileProps = {
  label: string;
  value: string | number | null | undefined;
  icon?: ReactNode;
};

const DashboardTile = ({ label, value, icon }: DashboardTileProps) => {
  return (
    <div className="card-tiles">
      <div>
        <h6>{label}</h6>
        <h3>{value ?? "--"}</h3>
      </div>
      {icon ? <div className="icon-box">{icon}</div> : null}
    </div>
  );
};

export default DashboardTile;
