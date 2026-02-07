import { authRequest } from "@/lib/auth/apiClient";

export type SuggestionSeverity = "LOW" | "MEDIUM" | "HIGH";

export type SuggestionItem = {
  suggestion: string;
  severity: SuggestionSeverity;
  explanation: string;
  metric_triggered: Record<string, unknown>;
};

export type ApiResponse<T> = {
  data?: T;
};

const apiGet = async <T>(url: string, params?: Record<string, unknown>) => {
  const response = await authRequest<T>({ method: "GET", url, params });
  return response.data as T;
};

export const analyticsApi = {
  overview: (params?: Record<string, unknown>) =>
    apiGet("/analytics/overview", params),
  performance: (params?: Record<string, unknown>) =>
    apiGet("/analytics/performance", params),
  risk: (params?: Record<string, unknown>) => apiGet("/analytics/risk", params),
  marketComparison: (params?: Record<string, unknown>) =>
    apiGet("/analytics/market-comparison", params),
};

export const sessionsApi = {
  list: (params?: Record<string, unknown>) => apiGet("/sessions", params),
  details: (id: string) => apiGet(`/sessions/${id}`),
  orders: (id: string, params?: Record<string, unknown>) =>
    apiGet(`/sessions/${id}/orders`, params),
  compare: (ids: string[]) => apiGet("/sessions/compare", { ids: ids.join(",") }),
  active: () => apiGet("/sessions/active"),
};

export const tradesApi = {
  list: (params?: Record<string, unknown>) => apiGet("/trades", params),
};

export const suggestionsApi = {
  session: (id: string) => apiGet(`/suggestions/session/${id}`),
  global: (params?: Record<string, unknown>) =>
    apiGet("/suggestions/global", params),
};

export type ScannerPair = {
  symbol: string;
  volatility: number;
  quote_volume: number;
  price_change_percent: number;
  high_price: string;
  low_price: string;
};

export type ScannerResponse = {
  quote_asset: string;
  window_size: string;
  pairs: ScannerPair[];
};

export const scannerApi = {
  getTopPairs: (params?: { asset?: string; window?: string }) =>
    apiGet<ScannerResponse>("/scanner", params as Record<string, unknown>),
};

export type BalanceRecord = {
  id: number;
  user_id: string;
  snapshot: Array<{ asset: string; free: number; locked: number }>;
  total_usd: string;
  total_btc: string;
  created_at: string;
  updated_at: string;
};

export type BalancesResponse = {
  data: BalanceRecord[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export const balancesApi = {
  list: (params?: { per_page?: number }) =>
    apiGet<BalancesResponse>("/balances", params as Record<string, unknown>),
};
