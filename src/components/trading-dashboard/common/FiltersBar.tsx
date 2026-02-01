"use client";

type FiltersBarProps = {
  filters: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onReset?: () => void;
};

const FiltersBar = ({ filters, onChange, onReset }: FiltersBarProps) => {
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
      <input
        className="form-control"
        style={{ maxWidth: 180 }}
        placeholder="Symbol"
        value={filters.symbol || ""}
        onChange={(event) => update("symbol", event.target.value)}
      />
      <input
        className="form-control"
        style={{ maxWidth: 180 }}
        placeholder="Strategy"
        value={filters.strategy_name || ""}
        onChange={(event) => update("strategy_name", event.target.value)}
      />
      <input
        type="number"
        className="form-control"
        style={{ maxWidth: 200 }}
        placeholder="Start date (unix)"
        value={filters.start_date_from || ""}
        onChange={(event) => update("start_date_from", event.target.value)}
      />
      <input
        type="number"
        className="form-control"
        style={{ maxWidth: 200 }}
        placeholder="End date (unix)"
        value={filters.start_date_to || ""}
        onChange={(event) => update("start_date_to", event.target.value)}
      />
      {onReset ? (
        <button className="btn btn-outline-secondary" onClick={onReset}>
          Reset
        </button>
      ) : null}
    </div>
  );
};

export default FiltersBar;
