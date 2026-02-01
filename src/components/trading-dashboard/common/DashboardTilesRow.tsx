"use client";

import { ReactNode } from "react";

type DashboardTilesRowProps = {
  children: ReactNode;
};

const DashboardTilesRow = ({ children }: DashboardTilesRowProps) => (
  <section className="dashboard-tiles mb-4">
    <div className="row g-3">{children}</div>
  </section>
);

export default DashboardTilesRow;
