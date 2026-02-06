"use client";

import React from "react";
import { AppMode, useMode } from "@/context/ModeContext";

const labelFor = (mode: AppMode) =>
  mode === "PRODUCTION" ? "Production" : "Testnet";

export const ModeToggle: React.FC = () => {
  const { mode, setMode } = useMode();

  const handleToggle = () => {
    setMode(mode === "PRODUCTION" ? "TESTNET" : "PRODUCTION");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="btn btn-sm app-theme-btn-secondary d-inline-flex align-items-center gap-2"
    >
      <span style={{ fontWeight: 500 }}>Mode</span>
      <span
        className="badge rounded-pill"
        style={{
          backgroundColor:
            mode === "PRODUCTION" ? "var(--app-success)" : "var(--app-warning)",
          color: "var(--app-on-primary)",
        }}
      >
        {labelFor(mode)}
      </span>
    </button>
  );
};

