"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  analyticsApi,
  suggestionsApi,
} from "@/lib/api/tradingDashboardApi";
import { formatNumber } from "@/utils/numberFormat";
import PageHeader from "../common/PageHeader";
import FiltersBar from "../common/FiltersBar";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import ChartCard from "../common/ChartCard";
import SectionCard from "../common/SectionCard";
import LineSeriesChart from "../charts/LineSeriesChart";
import BarSeriesChart from "../charts/BarSeriesChart";
import DashboardTile from "../common/DashboardTile";
import DashboardTilesRow from "../common/DashboardTilesRow";
import {
  RiWalletLine,
  RiLineChartLine,
  RiBarChart2Line,
  RiEqualizerLine,
} from "react-icons/ri";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ExecutiveOverviewPage = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, performance, risk, marketComparison, suggestions] =
        await Promise.all([
          analyticsApi.overview(appliedFilters),
          analyticsApi.performance(appliedFilters),
          analyticsApi.risk(appliedFilters),
          analyticsApi.marketComparison(appliedFilters),
          suggestionsApi.global(appliedFilters),
        ]);

      setPayload({
        overview,
        performance,
        risk,
        marketComparison,
        suggestions,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load executive overview.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const equityCurve = useMemo(() => {
    const avgReturn = payload?.overview?.overall?.avg_return_pct ?? null;
    if (avgReturn == null) {
      return [
        { name: "Start", equity: 100 },
        { name: "End", equity: 100 },
      ];
    }
    return [
      { name: "Start", equity: 100 },
      { name: "End", equity: 100 + avgReturn },
    ];
  }, [payload]);

  const drawdownCurve = useMemo(() => {
    const dd = payload?.risk?.metrics?.max_drawdown_pct ?? 0;
    return [
      { name: "Peak", drawdown: 0 },
      { name: "Trough", drawdown: -Math.abs(dd) },
    ];
  }, [payload]);

  const botVsMarket = useMemo(() => {
    const bot = payload?.marketComparison?.metrics?.bot_vs_buy_hold?.bot_return_pct ?? 0;
    const market =
      payload?.marketComparison?.metrics?.bot_vs_buy_hold?.buy_hold_return_pct ?? 0;
    return [
      { name: "Bot", value: bot },
      { name: "Buy & Hold", value: market },
    ];
  }, [payload]);

  const equityCategories = useMemo(
    () => equityCurve.map((p: any) => p.name),
    [equityCurve]
  );
  const equitySeries = useMemo(
    () => [
      {
        name: "Equity",
        data: equityCurve.map((p: any) => Number(p.equity ?? 0)),
      },
    ],
    [equityCurve]
  );
  const equityOptions = useMemo(
    () => ({
      chart: { type: "line" as const, toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: "smooth" as const, width: 3 },
      dataLabels: { enabled: false },
      xaxis: { categories: equityCategories },
      yaxis: {
        labels: {
          formatter: (val: number) => formatNumber(val, 8),
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => formatNumber(val, 8),
        },
      },
      colors: ["#0d6efd"],
    }),
    [equityCategories]
  );

  const drawdownCategories = useMemo(
    () => drawdownCurve.map((p: any) => p.name),
    [drawdownCurve]
  );
  const drawdownSeries = useMemo(
    () => [
      {
        name: "Drawdown",
        data: drawdownCurve.map((p: any) => Number(p.drawdown ?? 0)),
      },
    ],
    [drawdownCurve]
  );
  const drawdownOptions = useMemo(
    () => ({
      chart: { type: "line" as const, toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: "smooth" as const, width: 3 },
      dataLabels: { enabled: false },
      xaxis: { categories: drawdownCategories },
      yaxis: {
        labels: {
          formatter: (val: number) => formatNumber(val, 8),
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => formatNumber(val, 8),
        },
      },
      colors: ["#dc3545"],
    }),
    [drawdownCategories]
  );

  if (loading) return <LoadingState label="Loading executive overview..." />;
  if (error) return <ErrorState message={error} />;

  const kpis = [
    {
      label: "Total PnL",
      value: payload?.overview?.overall?.total_pnl ?? "--",
      icon: <RiWalletLine />,
    },
    {
      label: "Avg Return %",
      value: payload?.overview?.overall?.avg_return_pct ?? "--",
      icon: <RiLineChartLine />,
    },
    {
      label: "Win Rate %",
      value: payload?.performance?.metrics?.win_rate_pct ?? "--",
      icon: <RiBarChart2Line />,
    },
    {
      label: "Profit Factor",
      value: payload?.performance?.metrics?.profit_factor ?? "--",
      icon: <RiBarChart2Line />,
    },
    {
      label: "Max Drawdown %",
      value: payload?.risk?.metrics?.max_drawdown_pct ?? "--",
      icon: <RiBarChart2Line />,
    },
    {
      label: "Sharpe Ratio",
      value: payload?.risk?.metrics?.sharpe_ratio ?? "--",
      icon: <RiEqualizerLine />,
    },
  ];

  return (
    <div className="container-fluid">
      <PageHeader
        title="Executive Overview"
        subtitle="Performance, risk, and market comparison at a glance."
        actions={
          <button
            type="button"
            className="btn app-theme-btn-action"
            onClick={() => setAppliedFilters({ ...filters })}
          >
            Apply Filters
          </button>
        }
      />
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          setFilters({});
          setAppliedFilters({});
        }}
      />

      <DashboardTilesRow>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="col-12 col-md-6 col-xl-4">
            <DashboardTile label={kpi.label} value={kpi.value} icon={kpi.icon} />
          </div>
        ))}
      </DashboardTilesRow>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <SectionCard title="Equity Curve">
            <ReactApexChart
              options={equityOptions}
              series={equitySeries}
              type="line"
              height={260}
            />
          </SectionCard>
        </div>
        <div className="col-12 col-xl-6">
          <SectionCard title="Drawdown Curve">
            <ReactApexChart
              options={drawdownOptions}
              series={drawdownSeries}
              type="line"
              height={260}
            />
          </SectionCard>
        </div>
        <div className="col-12 col-xl-6">
          <SectionCard title="Bot vs Market">
            <BarSeriesChart
              data={botVsMarket}
              xKey="name"
              series={[{ key: "value", color: "#198754", name: "Return %" }]}
            />
          </SectionCard>
        </div>
        <div className="col-12 col-xl-6">
          <SectionCard title="Suggestions">
            {payload?.suggestions?.suggestions?.length ? (
              <div className="d-flex flex-column gap-3">
                {payload.suggestions.suggestions.map((item: any, index: number) => {
                  const confidence = item.confidence ?? 0.7;
                  const pct = Math.min(100, Math.max(0, Number(confidence) * 100));
                  return (
                    <div key={`${item.suggestion}-${index}`} className="app-theme-card rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong style={{ color: "var(--app-text)" }}>{item.suggestion}</strong>
                        <span className="badge app-theme-badge-action">{item.severity}</span>
                      </div>
                      <div className="app-theme-confidence-bar mb-2" style={{ height: 6, background: "var(--app-input-border)", borderRadius: 3 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--app-success)", borderRadius: 3 }} />
                      </div>
                      <p className="mb-0" style={{ color: "var(--app-text-muted)", fontSize: "0.9rem" }}>{item.explanation}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No suggestions"
                message="All key rules are within acceptable thresholds."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOverviewPage;
