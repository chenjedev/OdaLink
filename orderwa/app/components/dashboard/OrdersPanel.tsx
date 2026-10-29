"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  MessageCircle,
  Phone,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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
function toWhatsApp(phone: string, text?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "255" + digits.slice(1) : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${query}`;
}

const styles = `
.op-root {
  width: 100%;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

/* ---------- Status tabs ---------- */
.op-tabs {
  display: flex;
  gap: 4px;
  padding: 10px 12px;
  overflow-x: auto;
  border-bottom: 1px solid #e2e8f0;
  scrollbar-width: none;
}
.op-tabs::-webkit-scrollbar { display: none; }
.op-tab {
  flex: none;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 15px;
  text-transform: capitalize;
  cursor: pointer;
}
.op-tab.is-active { background: #eef2f6; color: #0f172a; font-weight: 600; }

/* ---------- Search row ---------- */
.op-searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 10px 0 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #94a3b8;
}
.op-searchbar input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 16px;
}
.op-filter-btn {
  position: relative;
  flex: none;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #475569;
  cursor: pointer;
}
.op-filter-btn.is-open { background: #eef2f6; }
.op-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0f766e;
}

/* ---------- Date panel (hidden until the filter icon is tapped) ---------- */
.op-datepanel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.op-date { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.op-date span { font-size: 13px; color: #64748b; }
.op-date input {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font-size: 16px;
}

/* ---------- Count + clear bar ---------- */
.op-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 13px;
  color: #64748b;
}
.op-clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.op-error { color: #dc2626; margin: 0; padding: 10px 16px; font-size: 14px; }

/* ---------- Order rows ---------- */
.op-row { border-bottom: 1px solid #eef2f6; }
.op-row:last-child { border-bottom: 0; }

.op-row-main {
  position: relative;
  display: block;
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
  text-align: left;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.op-row-main:hover,
.op-row-main:active,
.op-row-main:focus {
  background: transparent;
  outline: none;
}
.op-row-title { font-size: 16px; font-weight: 600; color: #0f172a; overflow-wrap: anywhere; }
.op-row-title span { color: #64748b; font-weight: 500; margin-right: 6px; }
.op-row-sub { margin-top: 2px; font-size: 14px; color: #64748b; }
.op-row-tags { margin-top: 8px; }
.op-chevron {
  position: absolute;
  top: 50%;
  right: 14px;
  margin-top: -9px;
  color: #94a3b8;
  transition: transform 0.15s ease;
}
.op-chevron.is-open { transform: rotate(180deg); }

.op-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}
.op-detail p { margin: 0; font-size: 14px; color: #0f172a; overflow-wrap: anywhere; }
.op-phone { color: #64748b; }

/* Call + WhatsApp buttons */
.op-contact {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
}
.op-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
}
.op-btn-wa { background: #0f766e; border-color: #0f766e; color: #fff; }

.op-detail-row { display: flex; align-items: center; gap: 10px; }
.op-detail-row span { font-size: 13px; color: #64748b; }

.op-select {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
}
.op-select:disabled { opacity: 0.6; }

.op-empty { padding: 28px 16px; text-align: center; color: #64748b; font-size: 15px; }

/* ---------- Status badge ---------- */
.op-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.op-badge-pending { background: #fef3c7; color: #b45309; }
.op-badge-confirmed { background: #dbeafe; color: #1d4ed8; }
.op-badge-delivered { background: #dcfce7; color: #15803d; }
.op-badge-cancelled { background: #fee2e2; color: #b91c1c; }
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
  const [showDates, setShowDates] = useState(false);
  const [openId, setOpenId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  // Opened from a link like /dashboard?tab=orders&q=33
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;

    setSearch(q);
    const match = orders.find((o) => String(o.id) === q);
    if (match) setOpenId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function formatDate(value: string) {
    const d = new Date(value);
    const loc = lang === "sw" ? "sw-TZ" : "en-GB";
    const day = d.toLocaleDateString(loc, { day: "numeric", month: "short" });
    const time = d.toLocaleTimeString(loc, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${time}`;
  }

  // Picking "From" starts "To" on the same day, and "To" can never be before "From".
  function handleFromChange(value: string) {
    setFrom(value);
    if (value && (!to || to < value)) setTo(value);
  }

  function handleToChange(value: string) {
    setTo(from && value && value < from ? from : value);
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

  const datesActive = Boolean(from || to);
  const hasFilters = Boolean(search || statusFilter !== "all" || datesActive);

  return (
    <div className="op-root">
      <style>{styles}</style>

      {/* Status tabs */}
      <div className="op-tabs">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={`op-tab${statusFilter === s ? " is-active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? t("All", "Zote") : statusLabel(s)}
          </button>
        ))}
      </div>

      {/* Search + filter icon */}
      <div className="op-searchbar">
        <Search size={20} />
        <input
          type="search"
          placeholder={t("Search orders", "Tafuta oda")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={`op-filter-btn${showDates ? " is-open" : ""}`}
          onClick={() => setShowDates((v) => !v)}
          aria-label={t("Filter by date", "Chuja kwa tarehe")}
        >
          <SlidersHorizontal size={20} />
          {datesActive && <span className="op-dot" />}
        </button>
      </div>

      {/* Dates: only visible after tapping the filter icon */}
      {showDates && (
        <div className="op-datepanel">
          <label className="op-date">
            <span>{t("From", "Kuanzia")}</span>
            <input
              type="date"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </label>

          <label className="op-date">
            <span>{t("To", "Hadi")}</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Count + clear */}
      <div className="op-bar">
        <span>
          {filtered.length} {t("orders", "oda")}
        </span>
        {hasFilters && (
          <button type="button" className="op-clear" onClick={clearFilters}>
            {t("Clear filters", "Futa vichujio")}
          </button>
        )}
      </div>

      {error && <p className="op-error">{error}</p>}

      {/* Orders */}
      {filtered.map((o) => {
        const open = openId === o.id;
        const greeting = t(
          `Hello ${o.customer_name}, this is about your order #${o.id}.`,
          `Habari ${o.customer_name}, kuhusu oda yako #${o.id}.`
        );

        return (
          <div key={o.id} className="op-row">
            <button
              type="button"
              className="op-row-main"
              onClick={() => setOpenId(open ? null : o.id)}
              aria-expanded={open}
            >
              <div className="op-row-title">
                <span>#{o.id}</span>
                {o.customer_name}
              </div>
              <div className="op-row-sub">
                {Number(o.total).toLocaleString()} TZS ·{" "}
                {formatDate(o.created_at)}
              </div>
              <div className="op-row-tags">
                <span className={`op-badge op-badge-${o.status.toLowerCase()}`}>
                  {statusLabel(o.status)}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`op-chevron${open ? " is-open" : ""}`}
              />
            </button>

            {open && (
              <div className="op-detail">
                <p>{itemsSummary(o.items) || "—"}</p>
                <p className="op-phone">{o.customer_phone}</p>

                <div className="op-contact">
                  <a className="op-btn" href={`tel:${o.customer_phone}`}>
                    <Phone size={16} />
                    {t("Call", "Piga simu")}
                  </a>

                  <a
                    className="op-btn op-btn-wa"
                    href={toWhatsApp(o.customer_phone, greeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                </div>

                <div className="op-detail-row">
                  <span>{t("Status", "Hali")}</span>
                  <select
                    className="op-select"
                    value={o.status}
                    disabled={o.status === "cancelled"}
                    onChange={(e) =>
                      void handleStatusChange(o.id, e.target.value)
                    }
                    aria-label={t("Change order status", "Badilisha hali ya oda")}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="op-empty">
          {t("No order found", "Hakuna oda iliyopatikana")}
        </p>
      )}
    </div>
  );
}
