"use client";

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { getInternalStatus, normalizeSide, toEpochMillis } from "../utils";

type OrderDetailsModalProps = {
  isOpen: boolean;
  toggle: () => void;
  order: any | null;
};

const OrderDetailsModal = ({ isOpen, toggle, order }: OrderDetailsModalProps) => {
  if (!order) return null;

  const internalStatus = getInternalStatus(order);
  const side = normalizeSide(order.side);
  const createdAt = order.created_at
    ? new Date(toEpochMillis(order.created_at) ?? 0).toLocaleString()
    : "--";
  const executedAt = order.executed_at
    ? new Date(toEpochMillis(order.executed_at) ?? 0).toLocaleString()
    : "--";
  const canceledAt = order.canceled_at
    ? new Date(toEpochMillis(order.canceled_at) ?? 0).toLocaleString()
    : "--";

  const sideColor = side === "BUY" ? "#198754" : "#dc3545";
  const statusColor =
    order.status === "FILLED"
      ? "#198754"
      : order.status === "CANCELED" || order.status === "REJECTED"
      ? "#dc3545"
      : "#ffc107";

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center gap-2">
          <span>Order Details</span>
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
                  <strong>Order ID:</strong> <code>{order.id}</code>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Exchange Order ID:</strong>{" "}
                  <code>{order.exchange_order_id ?? "--"}</code>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Symbol:</strong> {order.symbol ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Strategy:</strong> {order.strategy_name ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Type:</strong> {order.type ?? "--"}
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
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Status Information</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Exchange Status:</strong>{" "}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: statusColor,
                      color: "#fff",
                    }}
                  >
                    {order.status ?? "--"}
                  </span>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Internal Status:</strong>{" "}
                  <span className="badge bg-info">
                    {internalStatus ?? "UNKNOWN"}
                  </span>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Verified:</strong>{" "}
                  <span className="badge bg-secondary">
                    {order.verified === 1 ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Price & Quantity</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Price:</strong> {order.price ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Executed Price:</strong> {order.executed_price ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Quantity:</strong> {order.quantity ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Executed Quantity:</strong>{" "}
                  {order.executed_quantity ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Executed Quote Qty:</strong>{" "}
                  {order.executed_quote_qty ?? "--"}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Fees</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Fee:</strong> {order.fee ?? "--"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Fee Asset:</strong> {order.fee_asset ?? "--"}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded p-3">
              <h6 className="text-muted mb-2">Timestamps</h6>
              <div className="row">
                <div className="col-md-4 mb-2">
                  <strong>Created At:</strong>
                  <div className="text-muted small">{createdAt}</div>
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Executed At:</strong>
                  <div className="text-muted small">{executedAt}</div>
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Canceled At:</strong>
                  <div className="text-muted small">{canceledAt}</div>
                </div>
              </div>
            </div>
          </div>

          {order.params && (
            <div className="col-12">
              <div className="border rounded p-3">
                <h6 className="text-muted mb-2">Additional Parameters</h6>
                <pre
                  className="bg-light p-2 rounded"
                  style={{ fontSize: "12px", maxHeight: "200px", overflow: "auto" }}
                >
                  {JSON.stringify(JSON.parse(order.params || "{}"), null, 2)}
                </pre>
              </div>
            </div>
          )}
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

export default OrderDetailsModal;
