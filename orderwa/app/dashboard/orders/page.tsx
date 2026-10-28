
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type OrderItem = {
  product_id: number | string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

type Lang = "en" | "sw";

const STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

function itemsSummary(items: OrderItem[]) {
  if (!Array.isArray(items)) return "";
  return items.map((i) => `${i.name} x${i.quantity}`).join(", ");
}

// Assumes Tanzanian numbers: 0712... becomes 255712...
function toWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "255" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

export default function OrderPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("en");

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

  // Read the language selected in the dashboard Sidebar.
  useEffect(() => {
    function syncLanguage(event?: Event) {
      const customEvent = event as CustomEvent<Lang> | undefined;
      const eventLang = customEvent?.detail;
      const saved = localStorage.getItem("odLinkLanguage");

      const nextLang =
        eventLang === "en" || eventLang === "sw"
          ? eventLang
          : saved === "en" || saved === "sw"
            ? saved
            : "en";

      setLang(nextLang);
    }

    syncLanguage();

    window.addEventListener("odLinkLanguageChange", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("odLinkLanguageChange", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  // Opened from a WhatsApp link (?q=...): start with that search.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: shop, error: shopErr } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopErr || !shop) {
        console.error("Load shop failed:", shopErr?.message);
        setError("No shop found for this account");
        setLoading(false);
        return;
      }

      // The shop_id filter keeps this page to this shop's orders only.
      const { data, error: ordersErr } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_phone, items, total, status, created_at"
        )
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });

      if (ordersErr) {
        console.error("Load orders failed:", ordersErr.message);
        setError("Could not load orders");
      }

      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleStatusChange(orderId: number, newStatus: string) {
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

    // Keep original database status values in English.
    const { data, error: updateErr } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select("id");

    if (updateErr || !data || data.length === 0) {
      console.error("Update status failed:", updateErr?.message);
      setError("Could not update the status");
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  const q = search.toLowerCase();

  const filtered = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      itemsSummary(o.items).toLowerCase().includes(q) ||
      o.id.toString().includes(q)
  );

  if (loading) {
    return <p>{t("Loading orders...", "Inapakia oda...")}</p>;
  }

  return (
    <div className="products-page">
      <div className="product-header">
        <h2>{t("Orders", "Oda")}</h2>
      </div>

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

      {error && (
        <p style={{ color: "#dc2626" }}>
          {error === "No shop found for this account"
            ? t(error, "Hakuna duka lililopatikana kwenye akaunti hii")
            : error === "Could not load orders"
              ? t(error, "Imeshindwa kupakia oda")
              : error === "Could not update the status"
                ? t(error, "Imeshindwa kubadilisha hali ya oda")
                : error}
        </p>
      )}

      {/* Table: shown on large screens */}
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

                  <select
                    value={o.status}
                    disabled={o.status === "cancelled"}
                    onChange={(e) =>
                      handleStatusChange(o.id, e.target.value)
                    }
                    aria-label={t("Change order status", "Badilisha hali ya oda")}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
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

      {/* Cards: shown on phones */}
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
              <a
                href={toWhatsApp(o.customer_phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>{" "}
              · {new Date(o.created_at).toLocaleDateString()}
            </p>

            <p className="order-items">{itemsSummary(o.items)}</p>

            <div className="order-card-bottom">
              <strong>{Number(o.total).toLocaleString()} TZS</strong>

              <select
                value={o.status}
                disabled={o.status === "cancelled"}
                onChange={(e) =>
                  handleStatusChange(o.id, e.target.value)
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
        ))}

        {filtered.length === 0 && (
          <p>{t("No order found", "Hakuna oda iliyopatikana")}</p>
        )}
      </div>
    </div>
  );
}
