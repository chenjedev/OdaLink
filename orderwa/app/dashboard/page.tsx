"use client";

import StoreLink from "../components/dashboard/StoreLink";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ClipboardList,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
  Store,
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
};

type OrderRow = {
  id?: string;
  total: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  items_summary?: string;
};

type Lang = "en" | "sw";
type DashboardTab = "overview" | "orders" | "products" | "store";
type OrderFilter = "All" | "Pending" | "Confirmed" | "Delivered" | "Cancelled";

function sumTotals(list: OrderRow[]) {
  return list.reduce((sum, o) => sum + Number(o.total || 0), 0);
}

function formatTzs(amount: number) {
  return `TZS ${new Intl.NumberFormat("en-US").format(amount)}`;
}

const dashboardTabs: { id: DashboardTab; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "orders", label: "Orders", icon: <ClipboardList size={16} /> },
  { id: "products", label: "Products", icon: <Package size={16} /> },
  { id: "store", label: "Store", icon: <Store size={16} /> },
];

const filterOptions: OrderFilter[] = [
  "All",
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled",
];

function StatusTag({ status }: { status: string }) {
  const normalized =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <span className={`dashboard-status status-${status.toLowerCase()}`}>
      {normalized}
    </span>
  );
}

function OrderCard({
  order,
  onConfirm,
}: {
  order: OrderRow;
  onConfirm?: () => void;
}) {
  return (
    <article className="dashboard-order-card">
      <div className="dashboard-order-person">
        <strong>{order.customer_name || "Customer"}</strong>
        <span>{order.customer_phone || "—"}</span>
      </div>
      <p className="dashboard-order-items">
        {order.items_summary || "Items"}
      </p>
      <time className="dashboard-order-time">
        {new Date(order.created_at).toLocaleString()}
      </time>
      <div className="dashboard-order-side">
        <strong>{formatTzs(Number(order.total))}</strong>
        <StatusTag status={order.status} />
      </div>
      {onConfirm && order.status.toLowerCase() === "pending" && (
        <button
          className="dashboard-order-action"
          type="button"
          onClick={onConfirm}
        >
          <Check size={14} /> Confirm
        </button>
      )}
    </article>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="dashboard-metric-card">
      <span className="dashboard-metric-icon">{icon}</span>
      <span className="dashboard-metric-label">{label}</span>
      <strong className="dashboard-metric-value">{value}</strong>
      <span className="dashboard-metric-note">{note}</span>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [filter, setFilter] = useState<OrderFilter>("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

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

      const { data: shopData } = await supabase
        .from("shops")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .maybeSingle();

      setShop(shopData as Shop | null);

      if (shopData) {
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, price, stock")
          .eq("shop_id", shopData.id)
          .eq("is_active", true)
          .order("id");

        setProducts((productsData as Product[]) ?? []);

        const { data: ordersData } = await supabase
          .from("orders")
          .select(
            "id, total, status, created_at, customer_name, customer_phone, items_summary"
          )
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false });

        setOrders((ordersData as OrderRow[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const stockWorth = products.reduce(
    (sum, p) => sum + Number(p.price) * (p.stock ?? 0),
    0
  );

  const todayOrders = orders.filter(
    (o) =>
      new Date(o.created_at) >= startOfToday &&
      o.status.toLowerCase() !== "cancelled"
  );

  const pendingOrders = orders.filter(
    (o) => o.status.toLowerCase() === "pending"
  );

  const revenue = sumTotals(
    orders.filter(
      (o) =>
        o.status.toLowerCase() === "confirmed" ||
        o.status.toLowerCase() === "delivered"
    )
  );

  async function confirmOrder(orderId: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId);

    if (error) {
      setNotice("Failed to confirm order");
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed" } : o))
    );
    setNotice(t("Order confirmed", "Oda imethibitishwa"));
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

  const pageTitle = {
    overview: t(`Good morning, ${displayName}`, `Habari, ${displayName}`),
    orders: t("All orders", "Oda zote"),
    products: t("Products", "Bidhaa"),
    store: t("Store settings", "Mipangilio ya duka"),
  }[activeTab];

  const pageDescription = {
    overview: t(
      "Here is what is happening at your shop today.",
      "Hapa ndipo unavyoona kinachoendelea dukani leo."
    ),
    orders: t(
      "Review orders and keep customers updated.",
      "Angalia oda na sasisha wateja."
    ),
    products: t(
      "Manage the products and stock in your store.",
      "Dhibiti bidhaa na stoo yako."
    ),
    store: t(
      "Share your storefront and review your shop details.",
      "Shiriki link ya duka lako na angalia maelezo."
    ),
  }[activeTab];

  return (
    <div className="oda-dashboard">
      {/* TOP BAR */}
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
            <Link
              className="dashboard-topbar-store"
              href={`/store/${shop.slug}`}
            >
              View storefront <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </header>

      {/* TABS */}
      <div className="dashboard-tabs-wrapper">
        <div className="dashboard-tabs">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-tab${
                activeTab === tab.id ? " is-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <main className="dashboard-content">
        <div className="dashboard-page-heading">
          <div>
            <p className="dashboard-page-kicker">ODA LINK · SELLER</p>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>

          {shop && (
            <Link
              className="dashboard-primary-button"
              href={`/store/${shop.slug}`}
            >
              <Store size={16} /> {t("View store", "Angalia duka")}
            </Link>
          )}
        </div>

        {notice && (
          <p className="dashboard-live-message" role="status">
            {notice}
          </p>
        )}

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="dashboard-panel-stack">
            <section className="dashboard-metrics">
              <MetricCard
                icon={<ShoppingBag size={18} />}
                label={t("Orders today", "Oda za leo")}
                value={String(todayOrders.length).padStart(2, "0")}
                note={formatTzs(sumTotals(todayOrders))}
              />
              <MetricCard
                icon={<ClipboardList size={18} />}
                label={t("Pending orders", "Zinazosubiri")}
                value={String(pendingOrders.length).padStart(2, "0")}
                note={t("Ready for follow-up", "Zinazohitaji hatua")}
              />
              <MetricCard
                icon={<Package size={18} />}
                label={t("Products listed", "Bidhaa")}
                value={String(products.length).padStart(2, "0")}
                note={`${t("Stock worth", "Thamani ya stoo")} ${formatTzs(
                  stockWorth
                )}`}
              />
              <MetricCard
                icon={<CircleDollarSign size={18} />}
                label={t("Revenue", "Mapato")}
                value={formatTzs(revenue)}
                note={t(
                  "Confirmed + Delivered",
                  "Zilizothibitishwa + Zilizofikishwa"
                )}
              />
            </section>

            {shop && (
              <div className="mb-5">
                <StoreLink slug={shop.slug} shopName={shop.name} />
              </div>
            )}

            <section className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="dashboard-section-kicker">ORDERS</p>
                  <h2>{t("Recent orders", "Oda za hivi karibuni")}</h2>
                </div>
                <button
                  className="dashboard-text-link"
                  type="button"
                  onClick={() => setActiveTab("orders")}
                >
                  {t("View all", "Angalia zote")} <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="dashboard-order-list">
                {orders.slice(0, 3).map((order) => (
                  <OrderCard
                    key={order.id || order.created_at}
                    order={order}
                  />
                ))}
                {orders.length === 0 && (
                  <p className="dashboard-muted-copy">
                    {t("No orders yet.", "Bado hakuna oda.")}
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">ORDER MANAGEMENT</p>
                <h2>{t("All orders", "Oda zote")}</h2>
              </div>
              <span className="dashboard-soft-badge">
                {orders.length} {t("orders", "oda")}
              </span>
            </div>

            <div className="dashboard-order-tools">
              <div className="dashboard-filter-row">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`dashboard-filter-button${
                      filter === option ? " is-active" : ""
                    }`}
                    onClick={() => setFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <label className="dashboard-search">
                <Search size={16} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search orders", "Tafuta oda")}
                />
              </label>
            </div>

            <div className="dashboard-order-list">
              {orders
                .filter((o) => {
                  const statusMatch =
                    filter === "All" ||
                    o.status.toLowerCase() === filter.toLowerCase();
                  const q = search.toLowerCase();
                  const searchMatch =
                    !q ||
                    `${o.customer_name} ${o.items_summary} ${o.id}`
                      .toLowerCase()
                      .includes(q);
                  return statusMatch && searchMatch;
                })
                .map((order) => (
                  <OrderCard
                    key={order.id || order.created_at}
                    order={order}
                    onConfirm={
                      order.status.toLowerCase() === "pending" && order.id
                        ? () => confirmOrder(order.id!)
                        : undefined
                    }
                  />
                ))}
            </div>
          </section>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">YOUR CATALOG</p>
                <h2>{t("Products", "Bidhaa")}</h2>
              </div>
            </div>

            <div className="dashboard-products-grid">
              {products.map((product) => (
                <article key={product.id} className="dashboard-product-card">
                  <div className="dashboard-product-image">
                    <span>
                      {String(product.name).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="dashboard-product-copy">
                    <h3>{product.name}</h3>
                    <strong>{formatTzs(Number(product.price))}</strong>
                  </div>
                  <span
                    className={`dashboard-stock-count${
                      (product.stock ?? 0) <= 4 ? " is-low" : ""
                    }`}
                  >
                    {product.stock ?? 0} {t("in stock", "stoo")}
                  </span>
                </article>
              ))}
              {products.length === 0 && (
                <p className="dashboard-muted-copy">
                  {t("No products yet.", "Bado hakuna bidhaa.")}
                </p>
              )}
            </div>
          </section>
        )}

        {/* STORE */}
        {activeTab === "store" && shop && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">PUBLIC STOREFRONT</p>
                <h2>{t("Your store link", "Link ya duka lako")}</h2>
              </div>
            </div>
            <StoreLink slug={shop.slug} shopName={shop.name} />
          </section>
        )}
      </main>
    </div>
  );
}