"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/providers", label: "Providers" },
  { href: "/endpoints", label: "Endpoints" },
  { href: "/tests", label: "Tests" },
  { href: "/results", label: "Results" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  return (
    <nav className="w-full border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--brand-accent)] text-xl font-bold tracking-tight">tapi</span>
          <span className="text-[var(--brand-primary)] text-xl font-bold tracking-tight">tapi</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
        >
          {dark ? "☀" : "☽"}
        </button>
      </div>
    </nav>
  );
}
