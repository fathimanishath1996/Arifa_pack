"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { SiteSettings } from "@/lib/website-types";
import { SiteImage } from "@/components/site/site-ui";

/** Links only point to sections that exist on the page. */
const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#leadership", label: "Leadership" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#home" className="flex items-center gap-2" aria-label={settings.brandName}>
          <SiteImage src={settings.logo} alt={settings.brandName} width={48} height={48} className="size-12 object-contain" priority />
          <span className="text-sm font-semibold tracking-wide">{settings.brandName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-neutral-600 transition-colors hover:text-black">
              {link.label}
            </a>
          ))}
        </nav>

        <button onClick={() => setIsMenuOpen((open) => !open)} className="press grid size-10 place-items-center rounded-full md:hidden" aria-label="Menu" aria-expanded={isMenuOpen}>
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-neutral-200 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-neutral-100">
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
