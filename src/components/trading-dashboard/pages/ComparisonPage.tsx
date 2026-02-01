"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sessionsApi } from "@/lib/api/tradingDashboardApi";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import ChartCard from "../common/ChartCard";
import LineSeriesChart from "../charts/LineSeriesChart";
import SectionCard from "../common/SectionCard";
import { getSessionStatusClass } from "../utils";

const ComparisonPage = () => {
  const searchParams = useSearchParams();
  const initialIds = searchParams.get("ids") || "";
  const [ids, setIds] = useState(initialIds);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const loadComparison = useCallback(
    async (idsValue: string) => {
      const idList = idsValue
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (idList.length < 2) {
        setPayload(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await sessionsApi.compare(idList);
        setPayload(data);
      } catch (err: any) {
        setError(err?.message || "Failed to compare sessions.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialIds) {
      loadComparison(initialIds);
    }
  }, [initialIds, loadComparison]);

  const comparisonSeries = useMemo(() => {
    const sessions = payload?.sessions ?? [];
    return sessions.map((session: any) => ({
      name: session.id,
      return_pct: session.return_pct ?? 0,
    }));
  }, [payload]);

  return (
    <div className="container-fluid">
      <PageHeader
        title="Comparison"
        subtitle="Overlay multiple sessions and compare key metrics."
        actions={
          <button className="btn btn-primary" onClick={() => loadComparison(ids)}>
            Compare
          </button>
        }
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <input
          className="form-control"
          style={{ maxWidth: 420 }}
          placeholder="Session IDs (comma separated)"
          value={ids}
          onChange={(event) => setIds(event.target.value)}
        />
        <small className="text-muted align-self-center">
          Provide at least two session IDs.
        </small>
      </div>

      {loading ? (
        <LoadingState label="Comparing sessions..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : payload?.sessions?.length ? (
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <SectionCard title="Return % by Session">
              <LineSeriesChart
                data={comparisonSeries}
                xKey="name"
                series={[{ key: "return_pct", color: "#0d6efd", name: "Return %" }]}
              />
            </SectionCard>
          </div>
          <div className="col-12 col-xl-6">
            <SectionCard title="Session Metrics">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Symbol</th>
                      <th>PnL</th>
                      <th>Profit Factor</th>
                      <th>Max DD %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.sessions.map((session: any) => (
                      <tr key={session.id}>
                        <td>{session.id}</td>
                        <td>{session.symbol}</td>
                        <td>{session.pnl ?? "--"}</td>
                        <td>{session.profit_factor ?? "--"}</td>
                        <td>{session.max_drawdown_pct ?? "--"}</td>
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
      ) : (
        <EmptyState
          title="No comparison loaded"
          message="Enter session IDs to compare results."
        />
      )}
    </div>
  );
};

export default ComparisonPage;
