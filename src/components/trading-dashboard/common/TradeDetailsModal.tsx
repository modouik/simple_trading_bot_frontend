"use client";

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { normalizeSide, toEpochMillis } from "../utils";
import Link from "next/link";
import { useParams } from "next/navigation";

type TradeDetailsModalProps = {
  isOpen: boolean;
  toggle: () => void;
  trade: any | null;
};

const TradeDetailsModal = ({ isOpen, toggle, trade }: TradeDetailsModalProps) => {
  const params = useParams();
  const lng = params?.lng ?? "en";
  
  if (!trade) return null;

  const side = normalizeSide(trade.side);
  const executedAt = trade.executed_at
    ? new Date(toEpochMillis(trade.executed_at) ?? 0).toLocaleString()
    : "--";

  const sideColor = side === "BUY" ? "#198754" : "#dc3545";
  const totalValue = trade.price && trade.quantity 
    ? (Number(trade.price) * Number(trade.quantity)).toFixed(8)
    : "--";
  const totalAfterFee = trade.side?.toUpperCase() === "BUY"
    ? totalValue !== "--" && trade.fee
      ? (Number(totalValue) + Number(trade.fee)).toFixed(8)
      : "--"
    : totalValue !== "--" && trade.fee
    ? (Number(totalValue) - Number(trade.fee)).toFixed(8)
    : "--";

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center gap-2">
          <span>Trade Details</span>
          <span
            className="badge"
            style={{
              backgroundColor: sideColor,
              color: "#fff",
              fontSize: "12px",
            }}
          >
            {side}
          </span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="row g-3">
          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Basic Information</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Trade ID:</strong> <code>{trade.trade_id || trade.id}</code>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Internal ID:</strong> <code>{trade.id}</code>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Symbol:</strong> {trade.symbol ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Side:</strong>{" "}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: sideColor,
                      color: "#fff",
                    }}
                  >
                    {side}
                  </span>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Strategy:</strong> {trade.strategy_name ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Trading Session ID:</strong>{" "}
                  {trade.trading_session_id ? (
                    <Link
                      href={`/${lng}/trading/sessions/${trade.trading_session_id}`}
                      className="text-primary text-decoration-none"
                    >
                      {trade.trading_session_id}
                    </Link>
                  ) : (
                    "--"
                  )}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Order ID:</strong>{" "}
                  {trade.order_id ? (
                    <code>{trade.order_id}</code>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Price & Quantity</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Price:</strong> {trade.price ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Quantity:</strong> {trade.quantity ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Quote Quantity:</strong> {trade.quote_quantity ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Total Value:</strong> {totalValue}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Fees</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Fee:</strong> {trade.fee ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Fee Asset:</strong> {trade.fee_asset ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Total After Fee:</strong> {totalAfterFee}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Fee Percentage:</strong>{" "}
                  {totalValue !== "--" && trade.fee
                    ? ((Number(trade.fee) / Number(totalValue)) * 100).toFixed(4)
                    : "--"}
                  %
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Timestamps</h6>
              <div className="row">
                <div className="col-md-12 mb-2">
                  <strong>Executed At:</strong>
                  <div className="text-muted small">{executedAt}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Calculations</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Price × Quantity:</strong>{" "}
                  {trade.price && trade.quantity
                    ? `${trade.price} × ${trade.quantity} = ${totalValue}`
                    : "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Net Value ({side}):</strong>{" "}
                  {side === "BUY" 
                    ? `Value + Fee = ${totalAfterFee}`
                    : `Value - Fee = ${totalAfterFee}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TradeDetailsModal;
