"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tools", label: "Overview" },
  { href: "/tools/palo", label: "Main Loop (PALO)" },
  { href: "/tools/states", label: "States" },
  { href: "/tools/actions", label: "Actions" },
  { href: "/tools/rewards", label: "Rewards" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="tools-sidebar">
      <div className="sidebar-header">
        <span className="meta">RL System</span>
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

