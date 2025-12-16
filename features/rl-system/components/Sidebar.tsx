"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tools", label: "Tl;dr" },
  { href: "/tools/rewards", label: "Rewards" },
  { href: "/tools/actions", label: "Actions" },
  { href: "/tools/states", label: "States" },
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

