
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/dashboard/statcard";
import { supabase } from "../../lib/supabase";
import StoreLink from "../components/dashboard/StoreLink";

type Shop = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: number | string;
  name: string;
  price: number;
  stock: number | null;
};

type OrderRow = {
  total: number;
  status: string;
  created_at: string;
};

type Lang = "en" | "sw";

// Add up the totals of a list of orders.
function sumTotals(list: OrderRow[]) {
  return list.reduce((sum, o) => sum + Number(o.total), 0);
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  // Read the language selected in the dashboard Sidebar.
  useEffect(() => {
    function syncLanguage(event?: Event) {
      const customEvent = event as CustomEvent<Lang> | undefined;
      const eventLang = customEvent?.detail;
      const storedLang = localStorage.getItem("odLinkLanguage");

      const nextLang =
        eventLang === "en" || eventLang === "sw"
          ? eventLang
          : storedLang === "en" || storedLang === "sw"
            ? storedLang
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
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setDisplayName(
        user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email ||
          "User"
      );

      const { data: shopData, error: shopErr } = await supabase
        .from("shops")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopErr) console.error("Load shop failed:", shopErr.message);

      setShop(shopData as Shop | null);

      if (shopData) {
        // Only active products: deleted ones are hidden.
        const { data: productsData, error: productsErr } = await supabase
          .from("products")
          .select("id, name, price, stock")
          .eq("shop_id", shopData.id)
          .eq("is_active", true)
          .order("id");

        if (productsErr) {
          console.error("Load products failed:", productsErr.message);
        }

        setProducts((productsData as Product[]) ?? []);

        // This shop's orders, used for the stat cards.
        const { data: ordersData, error: ordersErr } = await supabase
          .from("orders")
          .select("total, status, created_at")
          .eq("shop_id", shopData.id);

        if (ordersErr) {
          console.error("Load orders failed:", ordersErr.message);
        }

        setOrders((ordersData as OrderRow[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <p>{t("Loading...", "Inapakia...")}</p>;
  }

  // Stats, worked out from the data we just loaded.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Money tied up in stock: price x quantity left, for every active product.
  const stockWorth = products.reduce(
    (sum, p) => sum + Number(p.price) * (p.stock ?? 0),
    0
  );

  // Orders placed today (cancelled ones are not counted).
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at) >= startOfToday && o.status !== "cancelled"
  );

  // Orders waiting for the seller to act.
  const pendingOrders = orders.filter((o) => o.status === "pending");

  // Revenue: only orders the seller confirmed or delivered.
  const revenue = sumTotals(
    orders.filter((o) => o.status === "confirmed" || o.status === "delivered")
  );

  return (
    <div>
      <h1>
        {t("Welcome", "Karibu")}, {displayName}
      </h1>

      {shop ? (
        <>
          <p>
            {t("Shop:", "Duka:")} <strong>{shop.name}</strong>
          </p>

          <StoreLink slug={shop.slug} shopName={shop.name} />
        </>
      ) : (
        <p>
          {t(
            "No shop found for this account.",
            "Hakuna duka lililopatikana kwenye akaunti hii."
          )}
        </p>
      )}

      <div className="stats-grid">
        <StatCard
          title={t("Products", "Bidhaa")}
          value={products.length}
          change={`${t("stock worth", "thamani ya bidhaa stoo")} ${stockWorth.toLocaleString()} TZS`}
        />

        <StatCard
          title={t("Orders today", "Oda za leo")}
          value={todayOrders.length}
          change={`${t("worth", "zenye thamani ya")} ${sumTotals(todayOrders).toLocaleString()} TZS`}
        />

        <StatCard
          title={t("Pending", "Zinazosubiri")}
          value={pendingOrders.length}
          change={`${t("worth", "zenye thamani ya")} ${sumTotals(pendingOrders).toLocaleString()} TZS`}
        />

        <StatCard
          title={t("Revenue (TZS)", "Mapato (TZS)")}
          value={revenue}
          change={t(
            "confirmed + delivered",
            "zilizothibitishwa + zilizofikishwa"
          )}
        />
      </div>
    </div>
  );
}
