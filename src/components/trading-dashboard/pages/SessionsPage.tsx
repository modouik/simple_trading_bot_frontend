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
              className="btn btn-outline-primary"
              onClick={compareSelected}
            >
              Compare Selected
            </button>
            <button className="btn btn-outline-secondary" onClick={exportSessions}>
              Export
            </button>
            <button
              className="btn btn-primary"
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
                        className="btn btn-sm btn-outline-primary"
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
      )}
    </div>
  );
};

export default SessionsPage;
