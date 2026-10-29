"use client";

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