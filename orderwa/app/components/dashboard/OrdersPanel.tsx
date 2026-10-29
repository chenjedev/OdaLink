"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

const styles = `
.op-root { width: 100%; min-width: 0; }

/* ---------- Filters ---------- */
.op-filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }

.op-search {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.op-search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
}

.op-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.op-chip {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 14px;
  cursor: pointer;
}
.op-chip.is-active { background: #0f766e; border-color: #0f766e; color: #fff; }

.op-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.op-date { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.op-date span { font-size: 13px; color: #64748b; }
.op-date input {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}

.op-clear {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
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
  .op-dates { max-width: 420px; }
}
`;

export default function OrdersPanel({
  orders,
  lang,
  onStatusChanged,
}: {
  orders: Order[];
  lang: Lang;
  onStatusChanged: (id: number | string, status: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  // Opened from a link like /dashboard?tab=orders&q=33
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

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

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setFrom("");
    setTo("");
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

  const q = search.trim().toLowerCase();
  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

  const filtered = orders.filter((o) => {
    const statusMatch =
      statusFilter === "all" || o.status.toLowerCase() === statusFilter;

    const searchMatch =
      !q ||
      (o.customer_name ?? "").toLowerCase().includes(q) ||
      (o.customer_phone ?? "").includes(q) ||
      itemsSummary(o.items).toLowerCase().includes(q) ||
      o.id.toString().includes(q);

    const created = new Date(o.created_at);
    const dateMatch =
      (!fromDate || created >= fromDate) && (!toDate || created <= toDate);

    return statusMatch && searchMatch && dateMatch;
  });

  const hasFilters = Boolean(search || statusFilter !== "all" || from || to);

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

      <div className="op-filters">
        <div className="op-search">
          <input
            type="search"
            placeholder={t(
              "Search order, customer, phone ...",
              "Tafuta oda, mteja au namba ya simu ..."
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
              className={`op-chip${statusFilter === s ? " is-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? t("All", "Zote") : statusLabel(s)}
            </button>
          ))}
        </div>

        <div className="op-dates">
          <label className="op-date">
            <span>{t("From", "Kuanzia")}</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="op-date">
            <span>{t("To", "Hadi")}</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>

        {hasFilters && (
          <button type="button" className="op-clear" onClick={clearFilters}>
            {t("Clear filters", "Futa vichujio")}
          </button>
        )}
      </div>

      {error && <p className="op-error">{error}</p>}

      {/* Table: tablets and desktops */}
      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>{t("Id", "Namba")}</th>
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
                <td>{o.id}</td>
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
                  <span
                    className={`op-badge op-badge-${o.status.toLowerCase()}`}
                  >
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
