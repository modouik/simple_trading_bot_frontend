"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { analyticsApi, sessionsApi } from "@/lib/api/tradingDashboardApi";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import ChartCard from "../common/ChartCard";
import LineSeriesChart from "../charts/LineSeriesChart";
import SectionCard from "../common/SectionCard";
import { getSessionStatusClass } from "../utils";

const LiveMonitoringPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLive = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [activeSessions, performance, risk] = await Promise.all([
        sessionsApi.active(),
        analyticsApi.performance(),
        analyticsApi.risk(),
      ]);
      setPayload({ activeSessions, performance, risk });
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || "Failed to load live monitoring data.");
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchLive(false);
    const interval = setInterval(() => fetchLive(true), 5000);
    return () => clearInterval(interval);
  }, [fetchLive]);

      const equitySeries = useMemo(() => {
        const expectancy = payload?.performance?.metrics?.expectancy_per_trade ?? 0;
        return [
          { name: "Now", equity: 100 },
          { name: "+1", equity: 100 + expectancy },
        ];
      }, [payload]);

      const returnBySession = useMemo(() => {
        const sessions = payload?.activeSessions?.data ?? payload?.activeSessions ?? [];
        return sessions.map((session: any) => ({
          name: session.id,
          return_pct: Number(session.return_pct ?? 0),
        }));
      }, [payload]);

  if (loading) return <LoadingState label="Loading live monitoring..." />;
  if (error) return <ErrorState message={error} />;

  const active = payload?.activeSessions?.data ?? payload?.activeSessions ?? [];

  return (
    <div className="container-fluid">
      <PageHeader
        title="Live Monitoring"
        subtitle="Real-time equity, open positions, and latency signals."
        actions={
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchLive(false)}
          >
            Refresh
          </button>
        }
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          Last updated: {lastUpdated?.toLocaleTimeString() ?? "--"}
        </div>
        <div className="d-flex align-items-center gap-2">
          {refreshing ? (
            <span className="badge bg-warning text-dark">Refreshing</span>
          ) : null}
          <div className="badge bg-success">
            Active sessions: {active.length}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-6">
          <ChartCard title="Real-time Equity" subtitle="Estimated equity drift">
            <LineSeriesChart
              data={equitySeries}
              xKey="name"
              series={[{ key: "equity", color: "#0d6efd", name: "Equity" }]}
            />
          </ChartCard>
        </div>
        <div className="col-12 col-xl-6">
          <ChartCard title="Risk Signals" subtitle="Drawdown and volatility">
            <div className="d-flex flex-column gap-3">
              <div className="border rounded p-3">
                <strong>Max Drawdown %</strong>
                <p className="mb-0 text-muted">
                  {payload?.risk?.metrics?.max_drawdown_pct ?? "--"}
                </p>
              </div>
              <div className="border rounded p-3">
                <strong>Sharpe Ratio</strong>
                <p className="mb-0 text-muted">
                  {payload?.risk?.metrics?.sharpe_ratio ?? "--"}
                </p>
              </div>
              <div className="border rounded p-3">
                <strong>Sortino Ratio</strong>
                <p className="mb-0 text-muted">
                  {payload?.risk?.metrics?.sortino_ratio ?? "--"}
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <SectionCard title="Return % by Session">
            <LineSeriesChart
              data={returnBySession}
              xKey="name"
              series={[
                { key: "return_pct", color: "#0d6efd", name: "Return %" },
              ]}
            />
          </SectionCard>
        </div>
        <div className="col-12 col-xl-6">
          <SectionCard title="Open Sessions">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Strategy</th>
                    <th>Symbol</th>
                    <th>Mode</th>
                    <th>Trades</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((session: any) => (
                    <tr key={session.id}>
                      <td>{session.id}</td>
                      <td>{session.strategy_name}</td>
                      <td>{session.symbol}</td>
                      <td>{session.mode}</td>
                      <td>{session.number_of_trades ?? "--"}</td>
                      <td>
                        <div className={getSessionStatusClass(session.status)}>
                          <span>{session.status ?? "unknown"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
