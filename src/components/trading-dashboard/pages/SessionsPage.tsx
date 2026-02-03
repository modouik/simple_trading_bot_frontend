"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { sessionsApi } from "@/lib/api/tradingDashboardApi";
import PageHeader from "../common/PageHeader";
import FiltersBar from "../common/FiltersBar";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import SectionCard from "../common/SectionCard";
import { getSessionStatusClass } from "../utils";

const SessionsPage = () => {
  const router = useRouter();
  const params = useParams();
  const lng = params?.lng ?? "en";
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionsPayload, setSessionsPayload] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await sessionsApi.list({
        per_page: 50,
        ...appliedFilters,
      });
      setSessionsPayload(payload);
    } catch (err: any) {
      setError(err?.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sessions = useMemo(() => {
    if (!sessionsPayload) return [];
    if (Array.isArray(sessionsPayload)) return sessionsPayload;
    return sessionsPayload.data ?? [];
  }, [sessionsPayload]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const compareSelected = () => {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (ids.length < 2) return;
    router.push(`/${lng}/trading/comparison?ids=${ids.join(",")}`);
  };

  const exportSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sessions-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="Loading sessions..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="container-fluid">
      <PageHeader
        title="Sessions"
        subtitle="Filter, inspect, and compare trading sessions."
        actions={
          <>
            <button
              type="button"
              className="btn app-theme-btn-outline"
              onClick={compareSelected}
            >
              Compare Selected
            </button>
            <button type="button" className="btn app-theme-btn-outline" onClick={exportSessions}>
              Export
            </button>
            <button
              type="button"
              className="btn app-theme-btn-action"
              onClick={() => setAppliedFilters({ ...filters })}
            >
              Apply Filters
            </button>
          </>
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

      {sessions.length === 0 ? (
        <EmptyState title="No sessions" message="No sessions match the filters." />
      ) : (
        <>
          <div className="d-lg-none mb-3">
            {sessions.map((session: any) => (
              <div key={session.id} className="app-theme-card rounded-3 p-3 mb-2">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <strong style={{ color: "var(--app-text)" }}>ID: {session.id}</strong>
                    <div style={{ color: "var(--app-text-muted)", fontSize: "0.9rem" }}>
                      {session.symbol} · {session.strategy_name}
                    </div>
                    <div style={{ color: "var(--app-text-muted)", fontSize: "0.85rem" }}>
                      Return: {session.return_pct ?? "--"} · PnL: {session.pnl ?? "--"}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${getSessionStatusClass(session.status)}`}>
                      {session.status ?? "unknown"}
                    </span>
                    <Link
                      className="btn btn-sm app-theme-btn-action"
                      href={`/${lng}/trading/sessions/${session.id}`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-none d-lg-block">
        <SectionCard title="List of All sessions">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th />
                  <th>ID</th>
                  <th>Strategy</th>
                  <th>Symbol</th>
                  <th>Mode</th>
                  <th>Return %</th>
                  <th>PnL</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session: any) => (
                  <tr key={session.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selectedIds[session.id]}
                        onChange={() => toggleSelection(session.id)}
                      />
                    </td>
                    <td>{session.id}</td>
                    <td>{session.strategy_name}</td>
                    <td>{session.symbol}</td>
                    <td>{session.mode}</td>
                    <td>{session.return_pct ?? "--"}</td>
                    <td>{session.pnl ?? "--"}</td>
                    <td>
                      <div className={getSessionStatusClass(session.status)}>
                        <span>{session.status ?? "unknown"}</span>
                      </div>
                    </td>
                    <td>
                      <Link
                        className="btn btn-sm app-theme-btn-action"
                        href={`/${lng}/trading/sessions/${session.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionsPage;
