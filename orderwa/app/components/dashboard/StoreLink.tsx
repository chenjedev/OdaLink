"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  shopName: string;
};

export default function StoreLink({ slug, shopName }: Props) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/store/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Order from ${shopName} here: ${url}`
  )}`;

  return (
    <div style={{ margin: "16px 0" }}>
      <p>Your store link</p>
      <p>
        <strong style={{ wordBreak: "break-all" }}>{url}</strong>
      </p>
      <button type="button" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy link"}
      </button>{" "}
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
        <button type="button">Share on WhatsApp</button>
      </a>
    </div>
  );
}
