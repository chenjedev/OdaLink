"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";

function BrandLockup() {
return (
odalink
);
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
return (
    {!compact && (
      <nav className="main-nav" aria-label="Main navigation">
        <a href="/#how-it-works">How it works</a>
        <a href="/#features">Features</a>
        <a href="/#about">Why OdaLink</a>
      </nav>
    )}
    <div className="header-actions">
      <a className="header-login" href="/login">Log in</a>
      <a className="header-cta" href="/signup">
        Start free <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  </div>
</header>

);
}

export function SiteFooter() {
return (
A little more structure for the way you already sell.
    <nav className="footer-nav" aria-label="Footer navigation">
      <a href="/login">Log in</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/store/demo">Demo store</a>
      <a href="/#top">
        Back to top <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </nav>
  </div>
  <div className="footer-bottom">
    <span>© {new Date().getFullYear()} OdaLink</span>
    <span>
      Made for small businesses that sell through conversation.
    </span>
  </div>
</footer>

);
}