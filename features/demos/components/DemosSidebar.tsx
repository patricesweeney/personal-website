"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Users,
  DollarSign,
  TrendingUp,
  Layers,
  Heart,
  FlaskConical,
  PanelLeftClose,
  PanelLeft,
  Target,
  PieChart,
  Zap,
  Package,
  Tags,
  ArrowUpRight
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Acquisition",
    icon: <Users size={16} />,
    items: [
      { 
        href: "/product/lead-scoring", 
        label: "Lead scoring",
        icon: <Target size={18} />,
      },
      { 
        href: "/product/marketing-mix", 
        label: "Marketing Mix Models",
        icon: <PieChart size={18} />,
      },
    ],
  },
  {
    title: "Monetization",
    icon: <DollarSign size={16} />,
    items: [
      { 
        href: "/product/activation-drivers", 
        label: "Activation drivers",
        icon: <Zap size={18} />,
      },
      { 
        href: "/product/packaging", 
        label: "Packaging",
        icon: <Package size={18} />,
      },
      { 
        href: "/product/pricing", 
        label: "Pricing",
        icon: <Tags size={18} />,
      },
    ],
  },
  {
    title: "NRR",
    icon: <TrendingUp size={16} />,
    items: [
      { 
        href: "/product/use-cases", 
        label: "Use cases",
        icon: <Layers size={18} />,
      },
      { 
        href: "/product/expansion-drivers", 
        label: "Expansion drivers",
        icon: <ArrowUpRight size={18} />,
      },
      { 
        href: "/product/retention-drivers", 
        label: "Retention drivers",
        icon: <Heart size={18} />,
      },
    ],
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
        <Link
          href="/product"
          className={`demo-nav-link ${pathname === "/product" ? "active" : ""}`}
          title={isCollapsed ? "Overview" : undefined}
        >
          <span className="nav-icon"><FlaskConical size={18} /></span>
          {!isCollapsed && <span className="nav-label">Overview</span>}
        </Link>

        {navSections.map((section) => (
          <div key={section.title} className="nav-section">
            {!isCollapsed && (
              <div className="section-header">
                <span className="section-icon">{section.icon}</span>
                <span className="section-title">{section.title}</span>
              </div>
            )}
            {section.items.length > 0 ? (
              section.items.map((item) => {
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
              })
            ) : (
              !isCollapsed && <span className="empty-section">Coming soon</span>
            )}
          </div>
        ))}
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

        .nav-section {
          margin-top: var(--space-4);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-3);
          margin-bottom: var(--space-1);
        }

        .section-icon {
          display: flex;
          align-items: center;
          color: var(--muted);
          opacity: 0.6;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
        }

        .empty-section {
          display: block;
          padding: var(--space-2) var(--space-3);
          font-size: 12px;
          color: var(--muted);
          opacity: 0.5;
          font-style: italic;
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

          .nav-section {
            margin-top: var(--space-2);
          }

          .section-header {
            display: none;
          }

          .empty-section {
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
