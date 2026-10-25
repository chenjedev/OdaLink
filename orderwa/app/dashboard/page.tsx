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
};

type OrderRow = {
  total: number;
  status: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

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
        // Only active products: deleted ones are hidden
        const { data: productsData, error: productsErr } = await supabase
          .from("products")
          .select("id, name, price")
          .eq("shop_id", shopData.id)
          .eq("is_active", true)
          .order("id");

        if (productsErr) {
          console.error("Load products failed:", productsErr.message);
        }

        setProducts((productsData as Product[]) ?? []);

        // This shop's orders, used for the stat cards
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
    return <p>Loading...</p>;
  }

  // Stats, worked out from the orders we just loaded
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Orders placed today (cancelled ones are not counted)
  const ordersToday = orders.filter(
    (o) => new Date(o.created_at) >= startOfToday && o.status !== "cancelled"
  ).length;

  // Orders waiting for the seller to act
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // Revenue: only orders the seller confirmed or delivered
  const revenue = orders
    .filter((o) => o.status === "confirmed" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <h1>Welcome, {displayName}</h1>

      {shop ? (
        <>
          <p>
            Shop: <strong>{shop.slug}</strong>
          </p>
          <StoreLink slug={shop.slug} shopName={shop.name} />
        </>
      ) : (
        <p>No shop found for this account.</p>
      )}

      <div className="stats-grid">
        <StatCard
          title="Products"
          value={products.length}
          change="in your shop"
        />
        <StatCard
          title="Orders today"
          value={ordersToday}
          change="not cancelled"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          change="need your action"
        />
        <StatCard
          title="Revenue (TZS)"
          value={revenue}
          change="confirmed + delivered"
        />
      </div>

      <h2>Products</h2>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} — {Number(p.price).toLocaleString()} TZS
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
