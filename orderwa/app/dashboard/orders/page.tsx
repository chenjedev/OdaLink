"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import OrdersPanel, {
  type Order,
} from "../../components/dashboard/OrdersPanel";

type Lang = "en" | "sw";

export default function OrderPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("en");

  // From the link in the WhatsApp message: ?order=32 shows that one order,
  // ?q=... starts with a search (older links).
  const [focusId, setFocusId] = useState<string | null>(null);
  const [initialSearch, setInitialSearch] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const q = params.get("q");

    if (order) setFocusId(order);
    if (q) setInitialSearch(q);
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

  function handleStatusChanged(id: number | string, status: string) {
    setOrders((prev) =>
      prev.map((o) => (String(o.id) === String(id) ? { ...o, status } : o))
    );
  }

  function showAllOrders() {
    setFocusId(null);
    router.replace("/dashboard/orders");
  }

  if (loading) {
    return <p>{t("Loading orders...", "Inapakia oda...")}</p>;
  }

  return (
    <div className="products-page">
      <div className="product-header">
        <h2>{t("Orders", "Oda")}</h2>
      </div>

      {error && (
        <p style={{ color: "#dc2626" }}>
          {error === "No shop found for this account"
            ? t(error, "Hakuna duka lililopatikana kwenye akaunti hii")
            : error === "Could not load orders"
            ? t(error, "Imeshindwa kupakia oda")
            : error}
        </p>
      )}

      <OrdersPanel
        orders={orders}
        lang={lang}
        onStatusChanged={handleStatusChanged}
        initialSearch={initialSearch}
        focusId={focusId}
        onShowAll={showAllOrders}
      />
    </div>
  );
}
