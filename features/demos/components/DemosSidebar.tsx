"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Target,
  FlaskConical,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  { 
    href: "/product", 
    label: "Overview",
    icon: <FlaskConical size={18} />,
    description: "About these demos"
  },
  { 
    href: "/product/poisson", 
    label: "Poisson Factorisation",
    icon: <BarChart3 size={18} />,
    description: "Customer behavior clustering"
  },
  { 
    href: "/product/survival", 
    label: "Survival Analysis",
    icon: <Clock size={18} />,
    description: "Time-to-churn modeling"
  },
  { 
    href: "/product/nrr", 
    label: "NRR Decomposition",
    icon: <TrendingUp size={18} />,
    description: "Revenue driver analysis"
  },
  { 
    href: "/product/propensity", 
    label: "Propensity Model",
    icon: <Target size={18} />,
    description: "Win probability scoring"
  },
];

export function DemosSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`demos-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!isCollapsed && <span className="meta">Product</span>}
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`demo-nav-link ${isActive ? "active" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
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
          transition: width 0.2s ease;
        }

        .demos-sidebar.collapsed {
          width: 64px;
          padding: var(--space-6) var(--space-2);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
          min-height: 24px;
        }

        .demos-sidebar.collapsed .sidebar-header {
          justify-content: center;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .collapse-btn:hover {
          background: var(--border);
          color: var(--fg);
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
          transition: all 0.15s ease;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
        }

        .demos-sidebar.collapsed :global(.demo-nav-link) {
          justify-content: center;
          padding: var(--space-2);
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
          flex-shrink: 0;
          opacity: 0.8;
        }

        :global(.demo-nav-link.active) .nav-icon {
          opacity: 1;
        }

        .nav-label {
          font-weight: 500;
          opacity: 1;
          transition: opacity 0.15s ease;
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

          .demos-sidebar.collapsed {
            width: 100%;
            padding: var(--space-4);
          }

          .sidebar-header {
            justify-content: space-between;
          }

          .collapse-btn {
            display: none;
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
