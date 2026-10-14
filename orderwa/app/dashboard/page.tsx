"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/dashboard/statcard";
import { supabase } from "../../lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

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
          .select("id, name, price, image")
          .eq("shop_id", shopData.id)
          .order("id");

        setProducts((productsData as Product[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {displayName}</h1>

      {shop ? (
        <p>
          Shop: <strong>{shop.name}</strong> ({shop.slug})
        </p>
      ) : (
        <p>Huna duka bado.</p>
      )}

      <div className="stats-grid">
        <StatCard
          title="Products"
          value={products.length}
          change="kutoka database"
        />
        <StatCard title="Orders today" value={0} change="baadaye" />
        <StatCard title="Pending" value={0} change="baadaye" />
        <StatCard title="Revenue" value={0} change="baadaye" />
      </div>

      <h2>Products</h2>
      {products.length === 0 ? (
        <p>Hakuna bidhaa bado.</p>
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
