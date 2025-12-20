"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Target,
  FlaskConical
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  { 
    href: "/demos", 
    label: "Overview",
    icon: <FlaskConical size={16} />,
    description: "About these demos"
  },
  { 
    href: "/demos/poisson", 
    label: "Poisson Factorisation",
    icon: <BarChart3 size={16} />,
    description: "Customer behavior clustering"
  },
  { 
    href: "/demos/survival", 
    label: "Survival Analysis",
    icon: <Clock size={16} />,
    description: "Time-to-churn modeling"
  },
  { 
    href: "/demos/nrr", 
    label: "NRR Decomposition",
    icon: <TrendingUp size={16} />,
    description: "Revenue driver analysis"
  },
  { 
    href: "/demos/propensity", 
    label: "Propensity Model",
    icon: <Target size={16} />,
    description: "Win probability scoring"
  },
];

export function DemosSidebar() {
  const pathname = usePathname();

  return (
    <aside className="demos-sidebar">
      <div className="sidebar-header">
        <span className="meta">Demos</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`demo-nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .demos-sidebar {
          position: sticky;
          top: 80px;
          width: 240px;
          flex-shrink: 0;
          padding: var(--space-6) var(--space-4);
          border-right: 1px solid var(--border);
          height: fit-content;
        }

        .sidebar-header {
          margin-bottom: var(--space-4);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        :global(.demo-nav-link) {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: var(--font-small);
          color: var(--muted);
          transition: background-color 0.15s, color 0.15s;
          text-decoration: none;
        }

        :global(.demo-nav-link:hover) {
          background-color: var(--border);
          color: var(--fg);
          text-decoration: none;
        }

        :global(.demo-nav-link.active) {
          background-color: var(--fg);
          color: var(--bg);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          opacity: 0.7;
        }

        :global(.demo-nav-link.active) .nav-icon {
          opacity: 1;
        }

        .nav-label {
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .demos-sidebar {
            position: relative;
            top: 0;
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: var(--space-4);
          }

          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--space-2);
          }

          :global(.demo-nav-link) {
            padding: var(--space-2) var(--space-3);
          }

          .nav-label {
            display: none;
          }

          :global(.demo-nav-link.active) .nav-label {
            display: inline;
          }
        }
      `}</style>
    </aside>
  );
}

