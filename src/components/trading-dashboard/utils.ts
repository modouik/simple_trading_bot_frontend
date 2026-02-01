type ParamsObject = Record<string, unknown>;

export const parseParams = (raw?: unknown): ParamsObject | null => {
  if (!raw) return null;
  if (typeof raw === "object") return raw as ParamsObject;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as ParamsObject) : null;
  } catch {
    return null;
  }
};

export const getInternalStatus = (order: any): string | null => {
  if (!order) return null;
  if (order.internal_status) return String(order.internal_status);
  const params = parseParams(order.params);
  const value = params?.internal_status;
  return value ? String(value) : null;
};

export const normalizeSide = (side?: string) =>
  side ? side.toUpperCase() : "";

export const toEpochMillis = (value?: number | null) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
};

export const sumBy = (items: any[], selector: (item: any) => number) =>
  items.reduce((acc, item) => acc + (selector(item) || 0), 0);

export const groupFeesByAsset = (trades: any[]) => {
  const totals: Record<string, number> = {};
  trades.forEach((trade) => {
    const asset = trade.fee_asset ?? "UNKNOWN";
    const fee = Number(trade.fee ?? 0);
    totals[asset] = (totals[asset] || 0) + fee;
  });
  return totals;
};

export const getSessionStatusClass = (status?: string | null): string => {
  if (!status) return "status-danger";
  const normalizedStatus = String(status).toUpperCase().trim();
  if (normalizedStatus === "COMPLETED") return "status-completed";
  if (normalizedStatus === "RUNNING") return "status-processing";
  return "status-danger";
};
