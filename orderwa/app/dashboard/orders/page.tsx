"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    router.replace(
      `/dashboard?tab=orders${q ? `&q=${encodeURIComponent(q)}` : ""}`
    );
  }, [router]);

  return null;
}
