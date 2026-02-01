"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { sessionsApi, suggestionsApi, tradesApi } from "@/lib/api/tradingDashboardApi";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import ChartCard from "../common/ChartCard";
import LineSeriesChart from "../charts/LineSeriesChart";
import OrderDetailsModal from "../common/OrderDetailsModal";
import DashboardTile from "../common/DashboardTile";
import DashboardTilesRow from "../common/DashboardTilesRow";
import SectionCard from "../common/SectionCard";
import {
  RiLineChartLine,
  RiWalletLine,
  RiBarChart2Line,
  RiGroupLine,
} from "react-icons/ri";
import {
  getInternalStatus,
  groupFeesByAsset,
  normalizeSide,
  sumBy,
  toEpochMillis,
} from "../utils";

const SessionDetailPage = () => {
  const params = useParams();
  const sessionId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionPayload, ordersPayload, suggestionPayload] = await Promise.all(
        [
          sessionsApi.details(sessionId),
          sessionsApi.orders(sessionId, { per_page: 100 }),
          suggestionsApi.session(sessionId),
        ]
      );
      setSession(sessionPayload);
      const orderList = Array.isArray(ordersPayload)
        ? ordersPayload
        : (ordersPayload as { data?: unknown[] })?.data ?? [];
      setOrders(orderList);
      try {
        const tradesPayload = await tradesApi.list({
          trading_session_id: sessionId,
          per_page: 200,
        });
        const tradeList = Array.isArray(tradesPayload)
          ? tradesPayload
          : (tradesPayload as { data?: unknown[] })?.data ?? [];
        setTrades(tradeList);
      } catch {
        setTrades([]);
      }
      setSuggestions(suggestionPayload);
    } catch (err: any) {
      setError(err?.message || "Failed to load session details.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [fetchSession, sessionId]);

  const equityCurve = useMemo(() => {
    if (!session) return [];
    return [
      { name: "Start", equity: session.initial_equity ?? 0 },
      { name: "End", equity: session.final_equity ?? session.initial_equity ?? 0 },
    ];
  }, [session]);

  const drawdownCurve = useMemo(() => {
    const dd = session?.max_drawdown_pct ?? 0;
    return [
      { name: "Peak", drawdown: 0 },
      { name: "Trough", drawdown: -Math.abs(dd) },
    ];
  }, [session]);

  const orderOverlay = useMemo(() => {
    if (!orders.length) return [];
    return orders
      .filter((order) => order.executed_at && order.executed_price)
      .map((order: any) => ({
        time: new Date(toEpochMillis(order.executed_at) ?? 0).toLocaleTimeString(),
        price: order.executed_price,
        buy: normalizeSide(order.side) === "BUY" ? order.executed_price : null,
        sell: normalizeSide(order.side) === "SELL" ? order.executed_price : null,
      }));
  }, [orders]);

  if (loading) return <LoadingState label="Loading session detail..." />;
  if (error) return <ErrorState message={error} />;
  if (!session) return <EmptyState title="Session not found" />;

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const metrics = [
    {
      label: "Return %",
      value: session.return_pct ?? "--",
      icon: <RiLineChartLine />,
    },
    { label: "PnL", value: session.pnl ?? "--", icon: <RiWalletLine /> },
    {
      label: "Win Rate %",
      value: session.win_rate ?? "--",
      icon: <RiBarChart2Line />,
    },
    {
      label: "Profit Factor",
      value: session.profit_factor ?? "--",
      icon: <RiBarChart2Line />,
    },
    {
      label: "Max Drawdown %",
      value: session.max_drawdown_pct ?? "--",
      icon: <RiLineChartLine />,
    },
    {
      label: "Trades",
      value: session.number_of_trades ?? "--",
      icon: <RiGroupLine />,
    },
  ];

  const totalQuote = sumBy(trades, (trade) =>
    Number(trade.quote_quantity ?? trade.quantity ?? 0)
  );
  const totalFees = sumBy(trades, (trade) => Number(trade.fee ?? 0));
  const feeByAsset = groupFeesByAsset(trades);
  const feeSummary = Object.keys(feeByAsset).length
    ? Object.entries(feeByAsset)
        .map(([asset, total]) => `${asset}: ${total.toFixed(6)}`)
        .join(" · ")
    : "--";

  return (
    <div className="container-fluid">
      <PageHeader
        title={`Session ${session.id}`}
        subtitle={`${session.symbol} · ${session.strategy_name}`}
      />

      <DashboardTilesRow>
        {metrics.map((metric) => (
          <div key={metric.label} className="col-12 col-md-6 col-xl-4">
            <DashboardTile
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
            />
          </div>
        ))}
      </DashboardTilesRow>

      <DashboardTilesRow>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Strategic Orders"
            value={orders.length}
            icon={<RiGroupLine />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Execution Trades"
            value={trades.length}
            icon={<RiLineChartLine />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Quote Volume"
            value={totalQuote.toFixed(4)}
            icon={<RiWalletLine />}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <DashboardTile
            label="Fees"
            value={feeSummary}
            icon={<RiBarChart2Line />}
          />
        </div>
      </DashboardTilesRow>

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-6">
          <SectionCard title="Equity Curve">
            <LineSeriesChart
              data={equityCurve}
              xKey="name"
              series={[{ key: "equity", color: "#0d6efd", name: "Equity" }]}
            />
          </SectionCard>
        </div>
        <div className="col-12 col-xl-6">
          <SectionCard title="Drawdown Curve">
            <LineSeriesChart
              data={drawdownCurve}
              xKey="name"
              series={[{ key: "drawdown", color: "#dc3545", name: "Drawdown" }]}
            />
          </SectionCard>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-7">
          <SectionCard title="Price + Orders Overlay">
            {orderOverlay.length ? (
              <LineSeriesChart
                data={orderOverlay}
                xKey="time"
                series={[
                  { key: "price", color: "#0d6efd", name: "Price" },
                  { key: "buy", color: "#198754", name: "BUY" },
                  { key: "sell", color: "#dc3545", name: "SELL" },
                ]}
              />
            ) : (
              <EmptyState
                title="No executed orders"
                message="Executed orders will appear here once available."
              />
            )}
          </SectionCard>
        </div>
        <div className="col-12 col-xl-5">
          <SectionCard title="Orders Timeline">
            {orders.length ? (
              <div className="d-flex flex-column gap-3">
                {orders.slice(0, 8).map((order: any) => {
                  const internalStatus = getInternalStatus(order);
                  const side = normalizeSide(order.side);
                  const sideColor = side === "BUY" ? "#198754" : "#dc3545";
                  return (
                    <div
                      key={order.id}
                      className="border rounded p-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="d-flex justify-content-between">
                        <strong>{normalizeSide(order.side)}</strong>
                        <span className="text-muted">
                          {internalStatus ?? "CREATED"} · {order.status ?? "--"}
                        </span>
                      </div>
                      <div className="text-muted">
                        Price: {order.executed_price ?? "--"} · Qty:{" "}
                        {order.executed_quantity ?? order.quantity ?? "--"}
                      </div>
                      <div className="text-muted">
                        Exchange ID: {order.exchange_order_id ?? "--"} · Verified:{" "}
                        {order.verified ?? 0}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No orders" message="Orders will appear here." />
            )}
          </SectionCard>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <SectionCard title="Optimization Suggestions">
            {suggestions?.suggestions?.length ? (
              <div className="d-flex flex-column gap-3">
                {suggestions.suggestions.map((item: any, index: number) => (
                  <div key={`${item.suggestion}-${index}`} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{item.suggestion}</strong>
                      <span className="badge bg-secondary">{item.severity}</span>
                    </div>
                    <p className="text-muted mb-0">{item.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No suggestions"
                message="The session is within healthy thresholds."
              />
            )}
          </SectionCard>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        toggle={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default SessionDetailPage;
