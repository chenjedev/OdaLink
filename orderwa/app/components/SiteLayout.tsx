"use client";

import { ArrowUpRight } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/255659148967?text=Hi%2C%20I%20want%20to%20set%20up%20my%20shop%20on%20OdaLink";

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

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

/**
 * compact = a slim footer for login / reset-password pages
 * (just the copyright, no links).
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="w-full bg-slate-50 py-6">
        <div className="max-w-[1100px] mx-auto px-5 flex flex-col items-center gap-1 text-center text-slate-400 text-sm">
          <span>© {year} OdaLink</span>
          <span>Made for small businesses that sell through conversation.</span>
        </div>
      </footer>
    );
  }

  const linkClass =
    "inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm transition-colors";

  return (
    <footer className="w-full bg-slate-50 pt-8 pb-6">
      <div className="max-w-[1100px] mx-auto px-5">
        {/* Top part */}
        <div className="mb-6">
          <BrandLockup />

          <p className="mt-3 text-slate-500 text-[0.95rem]">
            A little more structure for the way you already sell.
          </p>

          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-1">

            <a href="/login" className={linkClass}>
              Log in
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <WhatsAppIcon size={14} />
              WhatsApp
            </a>

            <a href="/#top" className={linkClass}>
              Back to top
              <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-4"></div>

        {/* Bottom */}
        <div className="flex flex-col gap-1 items-center text-slate-400 text-sm text-center">
          <span>© {year} OdaLink</span>
          <span>Made for small businesses that sell through conversation.</span>
        </div>
      </div>
    </footer>
  );
}
