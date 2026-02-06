"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { tradesApi } from "@/lib/api/tradingDashboardApi";
import { formatNumber } from "@/utils/numberFormat";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import ChartCard from "../common/ChartCard";
import BarSeriesChart from "../charts/BarSeriesChart";
import DashboardTile from "../common/DashboardTile";
import DashboardTilesRow from "../common/DashboardTilesRow";
import { RiGroupLine, RiWalletLine, RiBarChart2Line } from "react-icons/ri";
import TradeDetailsModal from "../common/TradeDetailsModal";
import SectionCard from "../common/SectionCard";

const TradesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradesApi.list({ per_page: 100 });
      setPayload(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load trades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const trades = useMemo(() => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  }, [payload]);

  const distribution = useMemo(() => {
    if (!trades.length) return [];
    let buyTotal = 0;
    let sellTotal = 0;
    trades.forEach((trade: any) => {
      const side = (trade.side ?? "").toUpperCase();
      const value = Number(trade.quote_quantity ?? trade.quantity ?? 0);
      if (side === "BUY") {
        buyTotal += value;
      } else if (side === "SELL") {
        sellTotal += value;
      }
    });
    return [
      { side: "BUY", total: buyTotal },
      { side: "SELL", total: sellTotal },
    ];
  }, [trades]);

  const totalTrades = trades.length;
  const totalQuoteVolumeNum = trades.reduce(
    (sum: number, trade: any) =>
      sum + Number(trade.quote_quantity ?? trade.quantity ?? 0),
    0
  );
  const totalQuoteVolume = formatNumber(totalQuoteVolumeNum, 8);
  const totalFeesNum = trades.reduce(
    (sum: number, trade: any) => sum + Number(trade.fee ?? 0),
    0
  );
  const totalFees = formatNumber(totalFeesNum, 8);
  const uniqueSessions = new Set(
    trades
      .map((t: any) => t.trading_session_id)
      .filter((id: string | null | undefined) => !!id)
  ).size;

  const handleTradeClick = (trade: any) => {
    setSelectedTrade(trade);
    setIsTradeModalOpen(true);
  };

  if (loading) return <LoadingState label="Loading trades..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="container-fluid">
      <PageHeader
        title="Trades"
        subtitle="Cross-session trades and distribution insights."
        actions={
          <button type="button" className="btn app-theme-btn-outline" onClick={fetchTrades}>
            Refresh
          </button>
        }
      />

      <DashboardTilesRow>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Total Trades"
            value={totalTrades}
            icon={<RiGroupLine />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Total Quote Volume"
            value={totalQuoteVolume}
            icon={<RiWalletLine />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Total Fees"
            value={totalFees}
            icon={<RiBarChart2Line />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Sessions"
            value={uniqueSessions}
            icon={<RiGroupLine />}
          />
        </div>
      </DashboardTilesRow>

      {trades.length === 0 ? (
        <EmptyState title="No trades" message="No trades available yet." />
      ) : (
        <div className="row g-3">
          <div className="col-12 col-xl-5">
            <SectionCard title="Trade Size Distribution">
              <BarSeriesChart
                data={distribution}
                xKey="side"
                series={[
                  {
                    key: "total",
                    color: "#0d6efd",
                    name: "Total Quote Qty",
                  },
                ]}
              />
            </SectionCard>
          </div>
          <div className="col-12 col-xl-7">
            <SectionCard title="List of trades">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Trade ID</th>
                      <th>Session</th>
                      <th>Order</th>
                      <th>Symbol</th>
                      <th>Side</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Quote Qty</th>
                      <th>Fee</th>
                      <th>Fee Asset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 20).map((trade: any) => {
                      const side = trade.side?.toUpperCase();
                      const sideColor = side === "BUY" ? "#198754" : "#dc3545";
                      return (
                        <tr
                          key={trade.id}
                          style={{
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                          onClick={() => handleTradeClick(trade)}
                        >
                          <td>
                            <code style={{ fontSize: "12px" }}>
                              {trade.trade_id || trade.id}
                            </code>
                          </td>
                          <td>{trade.trading_session_id ?? "--"}</td>
                          <td>{trade.order_id ?? "--"}</td>
                          <td>{trade.symbol}</td>
                          <td>
                            <span
                              className={`badge ${side === "BUY" ? "app-theme-badge-success" : "app-theme-badge-danger"}`}
                            >
                              {side}
                            </span>
                          </td>
                          <td>{trade.price ?? "--"}</td>
                          <td>{trade.quantity ?? "--"}</td>
                          <td>{trade.quote_quantity ?? "--"}</td>
                          <td>{trade.fee ?? "--"}</td>
                          <td>{trade.fee_asset ?? "--"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      <TradeDetailsModal
        isOpen={isTradeModalOpen}
        toggle={() => setIsTradeModalOpen(false)}
        trade={selectedTrade}
      />
    </div>
  );
};

export default TradesPage;
