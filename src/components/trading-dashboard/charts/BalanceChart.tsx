"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { balancesApi, type BalanceRecord } from "@/lib/api/tradingDashboardApi";
import { useMode } from "@/context/ModeContext";
import { format } from "date-fns";

const SLATE_800 = "#1e293b";
const SLATE_600 = "#475569";
const SLATE_400 = "#94a3b8";
const EMERALD_500 = "#10b981";

type ChartPoint = {
  date: string;
  total_usd: number;
  total_btc: number;
  created_at: string;
};

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBtc(value: number): string {
  return `${value.toFixed(8)} BTC`;
}

const BalanceChart = () => {
  const { mode } = useMode();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // mode is injected by apiClient for GET; list uses current app mode so chart shows balance for selected mode
      const res = await balancesApi.list({ per_page: 200 });
      const records = (res?.data ?? []) as BalanceRecord[];
      const points: ChartPoint[] = records.map((r) => ({
        date: format(new Date(r.created_at), "MMM d, HH:mm"),
        created_at: r.created_at,
        total_usd: parseFloat(r.total_usd ?? "0"),
        total_btc: parseFloat(r.total_btc ?? "0"),
      }));
      setData(points);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load balance history";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, mode]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl p-8"
        style={{ backgroundColor: SLATE_800, minHeight: 320 }}
      >
        <p className="text-slate-400">Loading balance history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl p-8"
        style={{ backgroundColor: SLATE_800, minHeight: 320 }}
      >
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl p-8"
        style={{ backgroundColor: SLATE_800, minHeight: 320 }}
      >
        <p className="text-slate-400">No balance history yet. Connect your exchange to sync.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl p-4"
      style={{ backgroundColor: SLATE_800 }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={SLATE_600} />
          <XAxis
            dataKey="date"
            stroke={SLATE_400}
            tick={{ fill: SLATE_400, fontSize: 12 }}
            tickLine={{ stroke: SLATE_600 }}
          />
          <YAxis
            yAxisId="usd"
            stroke={SLATE_400}
            tick={{ fill: SLATE_400, fontSize: 12 }}
            tickLine={{ stroke: SLATE_600 }}
            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: SLATE_800,
              border: `1px solid ${SLATE_600}`,
              borderRadius: "8px",
            }}
            labelStyle={{ color: SLATE_400 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !payload[0].payload) return null;
              const p = payload[0].payload as ChartPoint;
              return (
                <div className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 shadow-lg">
                  <p className="mb-1.5 text-sm font-medium text-slate-300">{label}</p>
                  <p className="text-sm text-emerald-400">{formatUsd(p.total_usd)}</p>
                  <p className="text-xs text-slate-400">{formatBtc(p.total_btc)}</p>
                </div>
              );
            }}
          />
          <Line
            yAxisId="usd"
            type="monotone"
            dataKey="total_usd"
            name="total_usd"
            stroke={EMERALD_500}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: EMERALD_500 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-6 text-sm text-slate-400">
        <span>Total USD over time</span>
        <span>• Tooltip shows BTC value</span>
      </div>
    </div>
  );
};

export default BalanceChart;
