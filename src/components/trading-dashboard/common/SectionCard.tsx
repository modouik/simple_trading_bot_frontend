"use client";

import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

const SectionCard = ({ title, headerRight, children }: SectionCardProps) => (
  <section className="mb-4">
    <div className="card app-theme-card">
      <div className="card-body">
        <div className="title-header">
          <div className="d-flex align-items-center">
            <h5>{title}</h5>
          </div>
          {headerRight}
        </div>
        {children}
      </div>
    </div>
  </section>
);

export default SectionCard;

