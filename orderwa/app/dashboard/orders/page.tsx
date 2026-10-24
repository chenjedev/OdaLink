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

const STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

function itemsSummary(items: OrderItem[]) {
  if (!Array.isArray(items)) return "";
  return items.map((i) => `${i.name} x${i.quantity}`).join(", ");
}

export default function OrderPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      // The shop_id filter keeps this page to this shop's orders only
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

    // .select() lets us see whether a row was really updated
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
    return <p>Loading orders...</p>;
  }

  return (
    <div className="products-page">
      <div className="product-header">
        <h2>Orders</h2>
      </div>

      <div className="search-wrapper">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          placeholder="Search order, customer, phone ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
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
                <td>{Number(o.total).toLocaleString()} Tsh</td>
                <td>
                  <span className={`badge badge-${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>{" "}
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="no-prod" colSpan={7}>
                  No order found
                </td>
              </tr>
            )}

            <tr>
              <td colSpan={7}>Total {filtered.length.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
