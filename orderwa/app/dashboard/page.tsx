
"use client";
import StatCard from "../components/dashboard/statcard";
import StoreLink from "../components/dashboard/StoreLink";
import AddProduct from "../components/dashboard/AddProduct";
import ShopSettings from "../components/dashboard/ShopSettings";
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

type DashboardTab =
  | "overview"
  | "orders"
  | "products"
  | "store"
  | "settings";

type OrderFilter =
  | "All"
  | "Pending"
  | "Confirmed"
  | "Delivered"
  | "Cancelled";

function sumTotals(list: OrderRow[]) {
  return list.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
}

function formatTzs(amount: number) {
  return `TZS ${new Intl.NumberFormat("en-US").format(amount)}`;
}

const dashboardTabs: {
  id: DashboardTab;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={16} />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <ClipboardList size={16} />,
  },
  {
    id: "products",
    label: "Products",
    icon: <Package size={16} />,
  },
  {
    id: "store",
    label: "Store",
    icon: <Store size={16} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon size={16} />,
  },
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
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase();

  return (
    <span
      className={`dashboard-status status-${status.toLowerCase()}`}
    >
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

      {onConfirm &&
        order.status.toLowerCase() === "pending" && (
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
  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");
  const [filter, setFilter] = useState<OrderFilter>("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const t = (en: string, sw: string) =>
    lang === "en" ? en : sw;

  // Shop URL: domain + slug
  const shopUrl = shop
    ? `https://odalink.vercel.app/${shop.slug}`
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

    window.addEventListener(
      "odLinkLanguageChange",
      syncLanguage
    );
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "odLinkLanguageChange",
        syncLanguage
      );
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  async function reloadProducts(shopId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock, category, image_url")
      .eq("shop_id", shopId)
      .eq("is_active", true)
      .order("id");

    if (error) {
      setNotice(
        t(
          "Could not reload products.",
          "Bidhaa hazikuweza kupakiwa."
        )
      );
      return;
    }

    setProducts((data as Product[]) ?? []);
  }

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

        setDisplayName(
          user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email ||
            "User"
        );

        const { data: shopData, error: shopError } =
          await supabase
            .from("shops")
            .select("id, name, slug")
            .eq("owner_id", user.id)
            .maybeSingle();

        if (shopError) throw shopError;
        if (!mounted) return;

        setShop(shopData as Shop | null);

        if (shopData) {
          const [productsResult, ordersResult] =
            await Promise.all([
              supabase
                .from("products")
                .select(
                  "id, name, price, stock, category, image_url"
                )
                .eq("shop_id", shopData.id)
                .eq("is_active", true)
                .order("id"),

              supabase
                .from("orders")
                .select(
                  "id, total, status, created_at, customer_name, customer_phone, items_summary"
                )
                .eq("shop_id", shopData.id)
                .order("created_at", {
                  ascending: false,
                }),
            ]);

          if (!mounted) return;

          if (productsResult.error) {
            console.error(productsResult.error.message);
          } else {
            setProducts(
              (productsResult.data as Product[]) ?? []
            );
          }

          if (ordersResult.error) {
            console.error(ordersResult.error.message);
          } else {
            setOrders(
              (ordersResult.data as OrderRow[]) ?? []
            );
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
    (sum, product) =>
      sum +
      Number(product.price) * (product.stock ?? 0),
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
      ["confirmed", "delivered"].includes(
        order.status.toLowerCase()
      )
    )
  );

  async function confirmOrder(orderId: string) {
    if (!shop) return;

    setNotice("");

    const { error } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId)
      .eq("shop_id", shop.id);

    if (error) {
      setNotice(
        t(
          "Failed to confirm order.",
          "Imeshindikana kuthibitisha oda."
        )
      );
      return;
    }

    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? { ...order, status: "confirmed" }
          : order
      )
    );

    setNotice(
      t("Order confirmed.", "Oda imethibitishwa.")
    );
  }

  async function copyShopLink() {
    if (!shopUrl) return;

    try {
      await navigator.clipboard.writeText(shopUrl);
      setNotice(
        t(
          "Shop link copied!",
          "Link ya duka imenakiliwa!"
        )
      );
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
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
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

  const pageTitle: Record<DashboardTab, string> = {
    overview: t(
      `Good morning, ${displayName}`,
      `Habari, ${displayName}`
    ),
    orders: t("All orders", "Oda zote"),
    products: t("Products", "Bidhaa"),
    store: t("Store", "Duka"),
    settings: t("Settings", "Mipangilio"),
  };

  const pageDescription: Record<DashboardTab, string> = {
    overview: t(
      "Here is what is happening at your shop today.",
      "Hapa ndipo unavyoona kinachoendelea dukani leo."
    ),
    orders: t(
      "Review orders and keep customers updated.",
      "Angalia oda na sasisha wateja."
    ),
    products: t(
      "Manage products, photos and stock.",
      "Dhibiti bidhaa, picha na stoo."
    ),
    store: t(
      "Share your storefront and review your shop details.",
      "Shiriki link ya duka lako na angalia maelezo."
    ),
    settings: t(
      "Manage shop details and payment methods.",
      "Dhibiti taarifa za duka na njia za malipo."
    ),
  };

  return (
    <div className="oda-dashboard">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <Link href="/" className="dashboard-brand">
            <div className="dashboard-brand-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
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
                <circle
                  cx="12"
                  cy="12"
                  r="1.6"
                  fill="#0d9488"
                />
              </svg>
            </div>
            <span>odalink</span>
          </Link>
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
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="dashboard-content">
        <div className="dashboard-page-heading">
          <div>
            <p className="dashboard-page-kicker">
              ODA LINK · SELLER
            </p>
            <h1>{pageTitle[activeTab]}</h1>
            <p>{pageDescription[activeTab]}</p>
          </div>
        </div>

        {notice && (
          <p
            className="dashboard-live-message"
            role="status"
          >
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
          <div className="dashboard-panel-stack">
            {/* Shop link appears before the stats */}
            <section className="dashboard-panel mb-5">
              <p className="dashboard-section-kicker">
                {t(
                  "YOUR SHOP LINK",
                  "LINK YA DUKA LAKO"
                )}
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

            {/* Shop statistics */}
          <section className="dashboard-metrics">
  <StatCard
    title={t("Orders today", "Oda za leo")}
    value={todayOrders.length}
    change={formatTzs(sumTotals(todayOrders))}
  />

  <StatCard
    title={t("Pending orders", "Oda zinazosubiri")}
    value={pendingOrders.length}
    change={t("Awaiting confirmation", "Zinasubiri uthibitisho")}
  />

  <StatCard
    title={t("Products listed", "Bidhaa zilizowekwa")}
    value={products.length}
    change={`${t("Stock worth", "Thamani ya stoo")}: ${formatTzs(stockWorth)}`}
  />

  <StatCard
    title={t("Revenue (TZS)", "Mapato (TZS)")}
    value={revenue}
    change={t(
      "Confirmed + delivered orders",
      "Oda zilizothibitishwa na zilizofikishwa"
    )}
  />
</section>
            <section className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="dashboard-section-kicker">
                    ORDERS
                  </p>
                  <h2>
                    {t(
                      "Recent orders",
                      "Oda za hivi karibuni"
                    )}
                  </h2>
                </div>

                <button
                  className="dashboard-text-link"
                  type="button"
                  onClick={() => setActiveTab("orders")}
                >
                  {t("View all", "Angalia zote")}{" "}
                  <ArrowUpRight size={14} />
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

        {activeTab === "orders" && shop && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">
                  ORDER MANAGEMENT
                </p>
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
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={t(
                    "Search orders",
                    "Tafuta oda"
                  )}
                />
              </label>
            </div>

            <div className="dashboard-order-list">
              {orders
                .filter((order) => {
                  const statusMatch =
                    filter === "All" ||
                    order.status.toLowerCase() ===
                      filter.toLowerCase();

                  const query = search.toLowerCase();

                  const searchMatch =
                    !query ||
                    `${order.customer_name ?? ""} ${
                      order.customer_phone ?? ""
                    } ${order.items_summary ?? ""} ${
                      order.id ?? ""
                    }`
                      .toLowerCase()
                      .includes(query);

                  return statusMatch && searchMatch;
                })
                .map((order) => (
                  <OrderCard
                    key={order.id || order.created_at}
                    order={order}
                    onConfirm={
                      order.status.toLowerCase() ===
                        "pending" && order.id
                        ? () => void confirmOrder(order.id!)
                        : undefined
                    }
                  />
                ))}
            </div>
          </section>
        )}

        {activeTab === "products" && shop && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">
                  YOUR CATALOG
                </p>
                <h2>{t("Products", "Bidhaa")}</h2>
              </div>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
              >
                + {t("Add product", "Ongeza bidhaa")}
              </button>
            </div>

            <div className="dashboard-products-grid">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="dashboard-product-card"
                  onClick={() => {
                    setEditingProduct(product);
                    setShowProductForm(true);
                  }}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  <div className="dashboard-product-image">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <span>
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="dashboard-product-copy">
                    <h3>{product.name}</h3>
                    <strong>
                      {formatTzs(Number(product.price))}
                    </strong>
                    {product.category && (
                      <p>{product.category}</p>
                    )}
                  </div>

                  <span
                    className={`dashboard-stock-count${
                      (product.stock ?? 0) <= 4
                        ? " is-low"
                        : ""
                    }`}
                  >
                    {product.stock ?? 0}{" "}
                    {t("in stock", "stoo")}
                  </span>
                </button>
              ))}

              {products.length === 0 && (
                <p className="dashboard-muted-copy">
                  {t("No products yet.", "Bado hakuna bidhaa.")}
                </p>
              )}
            </div>

            {showProductForm && (
              <AddProduct
                shopId={shop.id}
                product={editingProduct}
                onClose={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                onAdded={() => {
                  void reloadProducts(shop.id);
                }}
              />
            )}
          </section>
        )}

        {activeTab === "store" && shop && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">
                  PUBLIC STOREFRONT
                </p>
                <h2>
                  {t("Your store link", "Link ya duka lako")}
                </h2>
              </div>
            </div>

            <StoreLink
              slug={shop.slug}
              shopName={shop.name}
            />
          </section>
        )}

        {activeTab === "settings" && shop && (
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-section-kicker">
                  SHOP SETTINGS
                </p>
                <h2>{t("Settings", "Mipangilio")}</h2>
              </div>
            </div>

            <ShopSettings />
          </section>
        )}
      </main>
    </div>
  );
}
