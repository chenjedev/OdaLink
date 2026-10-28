"use client";

import { ArrowUpRight } from "lucide-react";

function BrandLockup() {
  return (
    <a href="/" className="flex items-center gap-2.5 no-underline">
      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      <span className="text-[1.35rem] font-bold text-teal-800 tracking-tight">
        odalink
      </span>
    </a>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="w-full bg-white border-b border-slate-100">
      <div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between">
        <BrandLockup />

        {!compact && (
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Start free
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full bg-slate-50 pt-12 pb-8">
      <div className="max-w-[1100px] mx-auto px-5">
        {/* Top part */}
        <div className="mb-8">
          <BrandLockup />

          <p className="mt-4 text-slate-500 text-[0.95rem]">
            A little more structure for the way you already sell.
          </p>

          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <a href="/login" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">
              Log in
            </a>
            <a href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">
              Dashboard
            </a>
            <a href="/store/demo" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">
              Demo store
            </a>
            <a href="/#top" className="text-slate-500 hover:text-slate-800 text-sm transition-colors inline-flex items-center gap-1">
              Back to top
              <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-6"></div>

        {/* Bottom */}
        <div className="flex flex-col gap-1 text-slate-400 text-sm">
          <span>© {new Date().getFullYear()} OdaLink</span>
          <span>Made for small businesses that sell through conversation.</span>
        </div>
      </div>
    </footer>
  );
}