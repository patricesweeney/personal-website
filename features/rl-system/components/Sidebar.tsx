"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/saas", label: "Tl;dr" },
  { href: "/saas/rewards", label: "Rewards" },
  { href: "/saas/actions", label: "Actions" },
  { href: "/saas/states", label: "States" },
  { href: "/saas/decentralisation", label: "Decentralisation" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="tools-sidebar">
      <div className="sidebar-header">
        <span className="meta">SaaS</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

