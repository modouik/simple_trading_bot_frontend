"use client";

import { useCallback, useEffect, useState } from "react";
import { scannerApi, type ScannerPair } from "@/lib/api/tradingDashboardApi";
import { formatNumber } from "@/utils/numberFormat";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";

const BINANCE_STABLECOINS = [
  { value: "USDT", label: "USDT" },
  { value: "USDC", label: "USDC" },
  { value: "BUSD", label: "BUSD" },
  { value: "FDUSD", label: "FDUSD" },
  { value: "TUSD", label: "TUSD" },
  { value: "USDP", label: "USDP" },
  { value: "DAI", label: "DAI" },
] as const;

const WINDOW_OPTIONS = [
  { value: "1m", label: "1 minute" },
  { value: "3m", label: "3 minutes" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "4h", label: "4 hours" },
  { value: "6h", label: "6 hours" },
  { value: "8h", label: "8 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
] as const;

const formatVolume = (v: number) => {
  if (v >= 1e9) return `${formatNumber(v / 1e9, 8)}B`;
  if (v >= 1e6) return `${formatNumber(v / 1e6, 8)}M`;
  if (v >= 1e3) return `${formatNumber(v / 1e3, 8)}K`;
  return formatNumber(v, 8);
};

const ScannerPage = () => {
  const [asset, setAsset] = useState<string>("USDC");
  const [windowSize, setWindowSize] = useState<string>("4h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ quote_asset: string; window_size: string; pairs: ScannerPair[] } | null>(null);

  const fetchScanner = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scannerApi.getTopPairs({ asset, window: windowSize });
      setData(res ?? null);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number } };
      const message =
        ax?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to load scanner data.");
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [asset, windowSize]);

  useEffect(() => {
    fetchScanner();
  }, [fetchScanner]);

  return (
    <div className="app-theme-page">
      <PageHeader
        title="Trading Scanner"
        subtitle="Top pairs by volatility (Binance), filtered by quote asset and time window."
      />

      <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="scanner-asset" className="form-label mb-0" style={{ color: "var(--app-text-muted)" }}>
            Quote asset
          </label>
          <select
            id="scanner-asset"
            className="form-select app-theme-input"
            style={{ minWidth: 120 }}
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
          >
            {BINANCE_STABLECOINS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="scanner-window" className="form-label mb-0" style={{ color: "var(--app-text-muted)" }}>
            Window
          </label>
          <select
            id="scanner-window"
            className="form-select app-theme-input"
            style={{ minWidth: 140 }}
            value={windowSize}
            onChange={(e) => setWindowSize(e.target.value)}
          >
            {WINDOW_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn app-theme-btn-action" onClick={fetchScanner} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {loading && <LoadingState label="Loading pairs…" />}
      {!loading && error && (
        <ErrorState
          title="Scanner error"
          message={error}
          action={
            <button type="button" className="btn app-theme-btn-action" onClick={fetchScanner}>
              Retry
            </button>
          }
        />
      )}
      {!loading && !error && data && (
        <div className="table-responsive">
          <table className="table app-theme-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-end">Volatility %</th>
                <th className="text-end">Quote volume</th>
                <th className="text-end">Price change %</th>
                <th className="text-end">High</th>
                <th className="text-end">Low</th>
              </tr>
            </thead>
            <tbody>
              {data.pairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No pairs found for {data.quote_asset} with window {data.window_size}.
                  </td>
                </tr>
              ) : (
                data.pairs.map((row) => (
                  <tr key={row.symbol}>
                    <td><strong>{row.symbol}</strong></td>
                    <td className="text-end">{formatNumber(row.volatility, 8)}</td>
                    <td className="text-end">{formatVolume(row.quote_volume)}</td>
                    <td className="text-end">
                      {row.price_change_percent >= 0 ? "+" : ""}
                      {formatNumber(row.price_change_percent, 8)}
                    </td>
                    <td className="text-end">{row.high_price}</td>
                    <td className="text-end">{row.low_price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
