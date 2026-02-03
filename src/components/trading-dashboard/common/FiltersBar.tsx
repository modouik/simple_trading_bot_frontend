"use client";

import { useState } from "react";

type FiltersBarProps = {
  filters: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onReset?: () => void;
};

const FiltersBar = ({ filters, onChange, onReset }: FiltersBarProps) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const filterContent = (
    <>
      <input
        className="form-control app-theme-input"
        style={{ maxWidth: 180 }}
        placeholder="Symbol"
        value={filters.symbol || ""}
        onChange={(event) => update("symbol", event.target.value)}
      />
      <input
        className="form-control app-theme-input"
        style={{ maxWidth: 180 }}
        placeholder="Strategy"
        value={filters.strategy_name || ""}
        onChange={(event) => update("strategy_name", event.target.value)}
      />
      <input
        type="number"
        className="form-control app-theme-input"
        style={{ maxWidth: 200 }}
        placeholder="Start date (unix)"
        value={filters.start_date_from || ""}
        onChange={(event) => update("start_date_from", event.target.value)}
      />
      <input
        type="number"
        className="form-control app-theme-input"
        style={{ maxWidth: 200 }}
        placeholder="End date (unix)"
        value={filters.start_date_to || ""}
        onChange={(event) => update("start_date_to", event.target.value)}
      />
      {onReset ? (
        <button type="button" className="btn app-theme-btn-outline" onClick={onReset}>
          Reset
        </button>
      ) : null}
    </>
  );

  return (
    <>
      <div className="d-none d-lg-flex flex-wrap gap-2 align-items-center mb-4 app-theme-filters-bar">
        {filterContent}
      </div>
      <div className="d-lg-none mb-4">
        <button
          type="button"
          className="btn app-theme-btn-action"
          onClick={() => setMobileFilterOpen(true)}
        >
          Filter
        </button>
      </div>
      {mobileFilterOpen && (
        <>
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div
            className="d-lg-none position-fixed bottom-0 start-0 end-0 app-theme-card p-4 rounded-top-3"
            style={{ zIndex: 1050, maxHeight: "70vh", overflowY: "auto" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: "var(--app-text)" }}>Filters</h5>
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => setMobileFilterOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {filterContent}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FiltersBar;
