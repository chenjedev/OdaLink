"use client";

import ShopSettings from "../components/dashboard/ShopSettings";
import ProductPage from "./products/page";
import OrdersPanel, {
  type Order,
  niceName,
} from "../components/dashboard/OrdersPanel";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings as SettingsIcon,
  Share2,
  Copy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  category?: string | null;
  image_url?: string | null;
};

type OrderRow = Order;

type Lang = "en" | "sw";

type DashboardTab =
  | "overview"
  | "orders"
  | "products"
  | "settings";

function sumTotals(list: OrderRow[]) {
  return list.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
}

function formatTzs(amount: number) {
  return `TZS ${new Intl.NumberFormat("en-US").format(amount)}`;
}

function formatNumber(amount: number) {
  return new Intl.NumberFormat("en-US").format(amount);
}

const layoutFix = `
.oda-dashboard,
.oda-dashboard * { box-sizing: border-box; }

.oda-dashboard {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.oda-dashboard .dashboard-content,
.oda-dashboard .dashboard-panel,
.oda-dashboard .dashboard-panel-stack {
  min-width: 0;
  max-width: 100%;
}

/* Tabs: one row, swipe sideways so every tab is always reachable */
.oda-dashboard .dashboard-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.oda-dashboard .dashboard-tabs::-webkit-scrollbar { display: none; }
.oda-dashboard .dashboard-tab { flex: none; white-space: nowrap; }

/* Products page brings its own margins and a padded table (products.css).
   Inside the dashboard panel, remove them so nothing is squeezed. */
.oda-dashboard .products-page {
  margin: 0 !important;
  padding: 0 !important;
  max-width: 100% !important;
}
.oda-dashboard .products-table {
  padding: 0 !important;
  border-radius: 16px;
  box-shadow: none;
}
.oda-dashboard .product-header { gap: 12px; }
.oda-dashboard img { max-width: 100%; }

/* View Storefront: no background, accent color text */
.oda-dashboard .dashboard-storefront-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  color: var(--brand, #0d9488) !important;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
.oda-dashboard .dashboard-storefront-link:hover { opacity: 0.8; }

/* ---------- Overview ---------- */
.oda-dashboard .ov-wrap { padding-bottom: 96px; }

.oda-dashboard .ov-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.oda-dashboard .ov-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  box-shadow: none;
  text-align: left;
  font: inherit;
  color: inherit;
}
.oda-dashboard button.ov-stat {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.oda-dashboard .ov-stat.is-alert {
  background: #fffbeb;
  border-color: #fde68a;
}
.oda-dashboard .ov-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #e6f4f1;
  color: #0f766e;
}
.oda-dashboard .ov-stat.is-alert .ov-icon {
  background: #fef3c7;
  color: #b45309;
}
.oda-dashboard .ov-label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-transform: none;
  letter-spacing: 0;
}
.oda-dashboard .ov-value {
  font-size: clamp(22px, 6.6vw, 28px);
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
}
.oda-dashboard .ov-note {
  font-size: 13px;
  color: #64748b;
  overflow-wrap: anywhere;
}

.oda-dashboard .ov-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  overflow: hidden;
}
.oda-dashboard .ov-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}
.oda-dashboard .ov-card-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.oda-dashboard .ov-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  color: #0f766e;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.oda-dashboard .ov-row {
  display: block;
  width: 100%;
  margin: 0;
  padding: 12px 16px 14px;
  border: 0;
  border-top: 1px solid #eef2f6;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.oda-dashboard .ov-row-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  overflow-wrap: anywhere;
}
.oda-dashboard .ov-row-title span {
  margin-right: 6px;
  color: #64748b;
  font-weight: 500;
}
.oda-dashboard .ov-row-sub {
  margin-top: 2px;
  font-size: 14px;
  color: #64748b;
}
.oda-dashboard .ov-badge {
  display: inline-block;
  margin-top: 8px;
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
.oda-dashboard .ov-badge-pending { background: #fef3c7; color: #b45309; }
.oda-dashboard .ov-badge-confirmed { background: #dbeafe; color: #1d4ed8; }
.oda-dashboard .ov-badge-delivered { background: #dcfce7; color: #15803d; }
.oda-dashboard .ov-badge-cancelled { background: #fee2e2; color: #b91c1c; }
.oda-dashboard .ov-empty {
  margin: 0;
  padding: 20px 16px;
  border-top: 1px solid #eef2f6;
  color: #64748b;
  font-size: 15px;
}
`;

const dashboardTabs: {
  id: DashboardTab;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "orders", label: "Orders", icon: <ClipboardList size={16} /> },
  { id: "products", label: "Products", icon: <Package size={16} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={16} /> },
];

function StatCard({
  icon,
  label,
  value,
  note,
  alert = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  alert?: boolean;
  onClick?: () => void;
}) {
  const className = `ov-stat${alert ? " is-alert" : ""}`;
  const content = (
    <>
      <span className="ov-icon">{icon}</span>
      <span className="ov-label">{label}</span>
      <strong className="ov-value">{value}</strong>
      <span className="ov-note">{note}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  // Shop URL: domain + /store/ + slug
  const shopUrl = shop
    ? `https://odalink.vercel.app/store/${shop.slug}`
    : "";

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
    let mounted = true;

    async function load() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (!mounted) return;

        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("id, name, slug")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (shopError) throw shopError;
        if (!mounted) return;

        setShop(shopData as Shop | null);

        if (shopData) {
          const [productsResult, ordersResult] = await Promise.all([
            supabase
              .from("products")
              .select("*")
              .eq("shop_id", shopData.id)
              .or("is_active.is.null,is_active.eq.true")
              .order("id"),

            supabase
              .from("orders")
              .select("*")
              .eq("shop_id", shopData.id)
              .order("created_at", { ascending: false }),
          ]);

          if (!mounted) return;

          if (productsResult.error) {
            console.error(productsResult.error.message);
          } else {
            setProducts((productsResult.data as Product[]) ?? []);
          }

          if (ordersResult.error) {
            console.error(ordersResult.error.message);
          } else {
            setOrders((ordersResult.data as OrderRow[]) ?? []);
          }
        }
      } catch (error) {
        console.error("Dashboard loading failed:", error);

        if (mounted) {
          setNotice(
            "Could not load all dashboard data. Please refresh."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const stockWorth = products.reduce(
    (sum, product) => sum + Number(product.price) * (product.stock ?? 0),
    0
  );

  const todayOrders = orders.filter(
    (order) =>
      new Date(order.created_at) >= startOfToday &&
      order.status.toLowerCase() !== "cancelled"
  );

  const pendingOrders = orders.filter(
    (order) => order.status.toLowerCase() === "pending"
  );

  const revenue = sumTotals(
    orders.filter((order) =>
      ["confirmed", "delivered"].includes(order.status.toLowerCase())
    )
  );

  function openOrders(status = "all") {
    setOrdersFilter(status);
    setActiveTab("orders");
  }

  function statusText(status: string) {
    if (lang === "en") return status;
    const labels: Record<string, string> = {
      pending: "Inasubiri",
      confirmed: "Imethibitishwa",
      delivered: "Imefikishwa",
      cancelled: "Imeghairiwa",
    };
    return labels[status.toLowerCase()] ?? status;
  }

  function shortDate(value: string) {
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

  async function copyShopLink() {
    if (!shopUrl) return;

    try {
      await navigator.clipboard.writeText(shopUrl);
      setNotice(t("Shop link copied!", "Link ya duka imenakiliwa!"));
    } catch {
      setNotice(
        t(
          "Could not copy the link. Please copy it manually.",
          "Imeshindwa kunakili link. Tafadhali nakili mwenyewe."
        )
      );
    }
  }

  async function shareShopLink() {
    if (!shop || !shopUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shop.name,
          text: t(
            `Visit ${shop.name} on OdaLink`,
            `Tembelea ${shop.name} kupitia OdaLink`
          ),
          url: shopUrl,
        });
      } else {
        await navigator.clipboard.writeText(shopUrl);
        setNotice(
          t(
            "Sharing is unavailable here. Link copied instead.",
            "Kushare hakupatikani hapa. Link imenakiliwa badala yake."
          )
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setNotice(
        t(
          "Could not share the link. Try copying it instead.",
          "Imeshindwa kushare link. Jaribu kuinakili."
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="oda-dashboard">
        <p className="p-8 text-center text-slate-500">
          {t("Loading...", "Inapakia...")}
        </p>
      </div>
    );
  }

  const pageDescription: Record<DashboardTab, string> = {
    overview: "",
    orders: t(
      "Review orders and keep customers updated.",
      "Angalia oda na sasisha wateja."
    ),
    products: t(
      "Manage products, photos and stock.",
      "Dhibiti bidhaa, picha na stoo."
    ),
    settings: t(
      "Manage shop details and payment methods.",
      "Dhibiti taarifa za duka na njia za malipo."
    ),
  };

  return (
    <div className="oda-dashboard">
      <style>{layoutFix}</style>

      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <Link href="/" className="dashboard-brand">
            <div className="dashboard-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                  fill="#0d9488"
                  fillOpacity="0.15"
                />
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                  stroke="#0d9488"
                  strokeWidth="1.6"
                  fill="none"
                />
                <circle cx="12" cy="12" r="1.6" fill="#0d9488" />
              </svg>
            </div>
            <span>odalink</span>
          </Link>

          {shop && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-storefront-link"
            >
              {t("View Storefront", "Angalia Duka")}
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </header>

      <div className="dashboard-tabs-wrapper">
        <div className="dashboard-tabs">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-tab${
                activeTab === tab.id ? " is-active" : ""
              }`}
              onClick={() => {
                setOrdersFilter("all");
                setActiveTab(tab.id);
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="dashboard-content">
        {activeTab !== "products" && activeTab !== "overview" && (
          <div className="dashboard-page-heading">
            <div>
              <p>{pageDescription[activeTab]}</p>
            </div>
          </div>
        )}

        {notice && (
          <p className="dashboard-live-message" role="status">
            {notice}
          </p>
        )}

        {!shop && (
          <section className="dashboard-panel">
            <h2>{t("No shop found", "Duka halijapatikana")}</h2>
            <p className="dashboard-muted-copy">
              {t(
                "We couldn't find a shop connected to your account.",
                "Hatukuweza kupata duka lililounganishwa na akaunti yako."
              )}
            </p>
          </section>
        )}

        {activeTab === "overview" && shop && (
          <div className="ov-wrap">
            <div className="ov-grid">
              <StatCard
                alert={pendingOrders.length > 0}
                icon={<ClipboardList size={18} />}
                label={t("Pending orders", "Zinazosubiri")}
                value={String(pendingOrders.length)}
                note={t("Tap to follow up", "Bonyeza kuzifuatilia")}
                onClick={() => openOrders("pending")}
              />

              <StatCard
                icon={<ShoppingBag size={18} />}
                label={t("Orders today", "Oda za leo")}
                value={String(todayOrders.length)}
                note={formatTzs(sumTotals(todayOrders))}
                onClick={() => openOrders("all")}
              />

              <StatCard
                icon={<Package size={18} />}
                label={t("Products", "Bidhaa")}
                value={String(products.length)}
                note={`${t("Stock worth", "Thamani ya stoo")} ${formatTzs(
                  stockWorth
                )}`}
                onClick={() => setActiveTab("products")}
              />

              <StatCard
                icon={<CircleDollarSign size={18} />}
                label={t("Revenue (TZS)", "Mapato (TZS)")}
                value={formatNumber(revenue)}
                note={t(
                  "Confirmed + delivered, all time",
                  "Zilizothibitishwa + zilizofikishwa, zote"
                )}
              />
            </div>

            <section className="ov-card">
              <div className="ov-card-head">
                <h2>{t("Recent orders", "Oda za hivi karibuni")}</h2>

                <button
                  type="button"
                  className="ov-link"
                  onClick={() => openOrders("all")}
                >
                  {t("View all", "Angalia zote")} <ArrowUpRight size={14} />
                </button>
              </div>

              {orders.slice(0, 3).map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="ov-row"
                  onClick={() => openOrders("all")}
                >
                  <div className="ov-row-title">
                    <span>#{order.id}</span>
                    {niceName(order.customer_name) || t("Customer", "Mteja")}
                  </div>
                  <div className="ov-row-sub">
                    {formatNumber(Number(order.total))} TZS ·{" "}
                    {shortDate(order.created_at)}
                  </div>
                  <span
                    className={`ov-badge ov-badge-${order.status.toLowerCase()}`}
                  >
                    {statusText(order.status)}
                  </span>
                </button>
              ))}

              {orders.length === 0 && (
                <p className="ov-empty">
                  {t("No orders yet.", "Bado hakuna oda.")}
                </p>
              )}
            </section>
          </div>
        )}

        {activeTab === "orders" && shop && (
          <div style={{ paddingBottom: 96 }}>
            <OrdersPanel
              key={ordersFilter}
              orders={orders}
              lang={lang}
              initialStatus={ordersFilter}
              onStatusChanged={(id, status) =>
                setOrders((prev) =>
                  prev.map((o) => (o.id === id ? { ...o, status } : o))
                )
              }
            />
          </div>
        )}

        {activeTab === "products" && shop && (
          <section className="dashboard-panel">
            <ProductPage />
          </section>
        )}

        {activeTab === "settings" && shop && (
          <div className="dashboard-panel-stack">
            <section className="dashboard-panel mb-5">
              <p className="dashboard-section-kicker">
                {t("YOUR SHOP LINK", "LINK YA DUKA LAKO")}
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-semibold text-teal-700 underline"
                >
                  {shopUrl}
                </a>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="dashboard-primary-button"
                    onClick={() => void copyShopLink()}
                  >
                    <Copy size={16} />
                    {t("Copy Link", "Nakili Link")}
                  </button>

                  <button
                    type="button"
                    className="dashboard-primary-button"
                    onClick={() => void shareShopLink()}
                  >
                    <Share2 size={16} />
                    {t("Share Link", "Shiriki Link")}
                  </button>
                </div>
              </div>
            </section>

            <section className="dashboard-panel">
              <ShopSettings />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
