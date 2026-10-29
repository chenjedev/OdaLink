"use client";

import { useState } from "react";
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

function toWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "255" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

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

  async function handleStatusChange(orderId: number | string, newStatus: string) {
    setError("");

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
      setError(t("Could not update the status", "Imeshindwa kubadilisha hali ya oda"));
      return;
    }

    onStatusChanged(orderId, newStatus);
  }

  const q = search.toLowerCase();
  const filtered = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      itemsSummary(o.items).toLowerCase().includes(q) ||
      o.id.toString().includes(q)
  );

  const StatusSelect = ({ o }: { o: Order }) => (
    <select
      value={o.status}
      disabled={o.status === "cancelled"}
      onChange={(e) => handleStatusChange(o.id, e.target.value)}
      aria-label={t("Change order status", "Badilisha hali ya oda")}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );

  return (
    <div className="products-page">
      <div className="search-wrapper">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          placeholder={t(
            "Search order, customer, phone ...",
            "Tafuta oda, mteja au namba ya simu ..."
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div className="table-wrapper orders-table">
        <table className="products-table">
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
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>{o.customer_name}</td>
                <td>{o.customer_phone}</td>
                <td>{itemsSummary(o.items)}</td>
                <td>{Number(o.total).toLocaleString()} TZS</td>
                <td>
                  <span className={`badge badge-${o.status.toLowerCase()}`}>
                    {statusLabel(o.status)}
                  </span>{" "}
                  <StatusSelect o={o} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="no-prod" colSpan={7}>
                  {t("No order found", "Hakuna oda iliyopatikana")}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={7}>
                {t("Total", "Jumla")} {filtered.length.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="orders-cards">
        {filtered.map((o) => (
          <div key={o.id} className="order-card">
            <div className="order-card-top">
              <strong>
                #{o.id} · {o.customer_name}
              </strong>
              <span className={`badge badge-${o.status.toLowerCase()}`}>
                {statusLabel(o.status)}
              </span>
            </div>
            <p className="order-meta">
              <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a> ·{" "}
              <a href={toWhatsApp(o.customer_phone)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{" "}
              · {new Date(o.created_at).toLocaleDateString()}
            </p>
            <p className="order-items">{itemsSummary(o.items)}</p>
            <div className="order-card-bottom">
              <strong>{Number(o.total).toLocaleString()} TZS</strong>
              <StatusSelect o={o} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>{t("No order found", "Hakuna oda iliyopatikana")}</p>}
      </div>
    </div>
  );
}
