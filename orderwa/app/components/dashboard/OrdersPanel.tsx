"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export type OrderItem = {
  product_id: number | string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: number | string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

type Lang = "en" | "sw";

const STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

export function itemsSummary(items: OrderItem[]) {
  if (!Array.isArray(items)) return "";
  return items.map((i) => `${i.name} x${i.quantity}`).join(", ");
}

// Assumes Tanzanian numbers: 0712... becomes 255712...
function toWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "255" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

// True when the order date is inside the chosen range.
// from/to look like "2026-10-29" (the value of <input type="date">).
function matchesDate(createdAt: string, from: string, to: string) {
  const d = new Date(createdAt);
  if (from && d < new Date(`${from}T00:00:00`)) return false;
  if (to && d > new Date(`${to}T23:59:59.999`)) return false;
  return true;
}

const styles = `
.op-root { width: 100%; min-width: 0; }

/* ---------- Search and filters ---------- */
.op-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.op-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
}

.op-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.op-chip {
  padding: 7px 14px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  text-transform: capitalize;
  cursor: pointer;
}
.op-chip-active { background: #0f766e; border-color: #0f766e; color: #fff; }

.op-dates {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 14px;
}
.op-date-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}
.op-date-input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 14px;
}
.op-clear {
  padding: 9px 12px;
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* ---------- Single order banner (opened from WhatsApp link) ---------- */
.op-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  background: #ecfdf5;
  color: #065f46;
  font-weight: 600;
}
.op-banner button {
  padding: 8px 12px;
  border: 1px solid #0f766e;
  border-radius: 8px;
  background: #fff;
  color: #0f766e;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.op-error { color: #dc2626; margin: 0 0 12px; }

/* ---------- Desktop table ---------- */
.op-table-wrap {
  display: none;
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.op-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.op-table th {
  text-align: left;
  padding: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.op-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.op-table .op-items { min-width: 180px; }
.op-table .op-nowrap { white-space: nowrap; }
.op-table .op-empty { text-align: center; color: #64748b; }
.op-table tfoot td { font-weight: 600; background: #f8fafc; }

/* ---------- Mobile cards ---------- */
.op-cards { display: flex; flex-direction: column; gap: 12px; }
.op-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.op-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.op-card-top strong { min-width: 0; overflow-wrap: anywhere; }
.op-meta { margin: 0; font-size: 13px; color: #64748b; overflow-wrap: anywhere; }
.op-meta a { color: #0f766e; font-weight: 500; }
.op-card-items { margin: 0; font-size: 14px; color: #0f172a; overflow-wrap: anywhere; }
.op-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}
.op-empty-card { text-align: center; color: #64748b; margin: 8px 0; }

/* ---------- Status ---------- */
.op-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  white-space: nowrap;
}
.op-badge-pending { background: #fef3c7; color: #b45309; }
.op-badge-confirmed { background: #dbeafe; color: #1d4ed8; }
.op-badge-delivered { background: #dcfce7; color: #15803d; }
.op-badge-cancelled { background: #fee2e2; color: #b91c1c; }

.op-select {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  max-width: 100%;
}
.op-select:disabled { opacity: 0.6; }

@media (min-width: 768px) {
  .op-table-wrap { display: block; }
  .op-cards { display: none; }
}
`;

export default function OrdersPanel({
  orders,
  lang,
  onStatusChanged,
  initialSearch = "",
  focusId = null,
  onShowAll,
}: {
  orders: Order[];
  lang: Lang;
  onStatusChanged: (id: number | string, status: string) => void;
  initialSearch?: string;
  // When set, only this order is shown (opened from the seller link in WhatsApp).
  focusId?: string | null;
  onShowAll?: () => void;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  function statusLabel(status: string) {
    if (lang === "en") return status;

    const labels: Record<string, string> = {
      pending: "Inasubiri",
      confirmed: "Imethibitishwa",
      delivered: "Imefikishwa",
      cancelled: "Imeghairiwa",
    };

    return labels[status.toLowerCase()] ?? status;
  }

  async function handleStatusChange(
    orderId: number | string,
    newStatus: string
  ) {
    setError("");

    // Cancelling is permanent (stock goes back), so ask first.
    if (newStatus === "cancelled") {
      const ok = window.confirm(
        t(
          "Cancel this order? The stock will be returned and the order cannot be reopened.",
          "Umeghairi oda hii? Bidhaa zitarudishwa kwenye stoo na oda hii haitaweza kufunguliwa tena."
        )
      );

      if (!ok) return;
    }

    const { data, error: updateErr } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select("id");

    if (updateErr || !data || data.length === 0) {
      console.error("Update status failed:", updateErr?.message);
      setError(
        t("Could not update the status", "Imeshindwa kubadilisha hali ya oda")
      );
      return;
    }

    onStatusChanged(orderId, newStatus);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters =
    search !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  const q = search.trim().toLowerCase();

  // One order (seller link) or the normal filtered list.
  const filtered = focusId
    ? orders.filter((o) => String(o.id) === String(focusId))
    : orders.filter(
        (o) =>
          (o.customer_name.toLowerCase().includes(q) ||
            o.customer_phone.includes(q) ||
            itemsSummary(o.items).toLowerCase().includes(q) ||
            o.id.toString().includes(q)) &&
          (statusFilter === "all" || o.status === statusFilter) &&
          matchesDate(o.created_at, dateFrom, dateTo)
      );

  function renderSelect(o: Order) {
    return (
      <select
        className="op-select"
        value={o.status}
        disabled={o.status === "cancelled"}
        onChange={(e) => void handleStatusChange(o.id, e.target.value)}
        aria-label={t("Change order status", "Badilisha hali ya oda")}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="op-root">
      <style>{styles}</style>

      {focusId ? (
        <div className="op-banner">
          <span>
            {t(`Showing order #${focusId}`, `Inaonyesha oda #${focusId}`)}
          </span>
          {onShowAll && (
            <button type="button" onClick={onShowAll}>
              {t("Show all orders", "Onyesha oda zote")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="op-search">
            <input
              type="text"
              placeholder={t(
                "Search order ID, customer, phone ...",
                "Tafuta namba ya oda, mteja au simu ..."
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="op-chips">
            {["all", ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                className={`op-chip ${statusFilter === s ? "op-chip-active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? t("All", "Zote") : statusLabel(s)}
              </button>
            ))}
          </div>

          <div className="op-dates">
            <label className="op-date-label">
              {t("From", "Kuanzia")}
              <input
                type="date"
                className="op-date-input"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>

            <label className="op-date-label">
              {t("To", "Hadi")}
              <input
                type="date"
                className="op-date-input"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>

            {hasFilters && (
              <button type="button" className="op-clear" onClick={clearFilters}>
                {t("Clear filters", "Futa vichujio")}
              </button>
            )}
          </div>
        </>
      )}

      {error && <p className="op-error">{error}</p>}

      {/* Table: tablets and desktops */}
      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>{t("Order ID", "Namba ya oda")}</th>
              <th>{t("Date", "Tarehe")}</th>
              <th>{t("Customer", "Mteja")}</th>
              <th>{t("Phone", "Simu")}</th>
              <th>{t("Items", "Bidhaa")}</th>
              <th>{t("Total", "Jumla")}</th>
              <th>{t("Status", "Hali")}</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td className="op-nowrap">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td>{o.customer_name}</td>
                <td className="op-nowrap">{o.customer_phone}</td>
                <td className="op-items">{itemsSummary(o.items)}</td>
                <td className="op-nowrap">
                  {Number(o.total).toLocaleString()} TZS
                </td>
                <td className="op-nowrap">
                  <span className={`op-badge op-badge-${o.status.toLowerCase()}`}>
                    {statusLabel(o.status)}
                  </span>{" "}
                  {renderSelect(o)}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="op-empty" colSpan={7}>
                  {t("No order found", "Hakuna oda iliyopatikana")}
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={7}>
                {t("Total", "Jumla")} {filtered.length.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cards: phones */}
      <div className="op-cards">
        {filtered.map((o) => (
          <div key={o.id} className="op-card">
            <div className="op-card-top">
              <strong>
                #{o.id} · {o.customer_name}
              </strong>
              <span className={`op-badge op-badge-${o.status.toLowerCase()}`}>
                {statusLabel(o.status)}
              </span>
            </div>

            <p className="op-meta">
              <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a> ·{" "}
              <a
                href={toWhatsApp(o.customer_phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>{" "}
              · {new Date(o.created_at).toLocaleDateString()}
            </p>

            <p className="op-card-items">{itemsSummary(o.items)}</p>

            <div className="op-card-bottom">
              <strong>{Number(o.total).toLocaleString()} TZS</strong>
              {renderSelect(o)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="op-empty-card">
            {t("No order found", "Hakuna oda iliyopatikana")}
          </p>
        )}
      </div>
    </div>
  );
}
