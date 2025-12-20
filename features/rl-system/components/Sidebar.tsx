"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SubItem {
  id: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  subItems?: SubItem[];
}

const navItems: NavItem[] = [
  { href: "/saas", label: "Philosophy" },
  { 
    href: "/saas/rewards", 
    label: "Value",
    subItems: [
      { id: "customer-equity", label: "Customer equity" },
      { id: "customer-lifetime-value", label: "Customer lifetime value" },
      { id: "near-decomposability-of-clv", label: "Near-decomposability" },
      { id: "state-value", label: "State value" },
      { id: "action-value", label: "Action value" },
    ]
  },
  { 
    href: "/saas/states", 
    label: "Customer states",
    subItems: [
      { id: "observations", label: "Observations" },
      { id: "representation-learning", label: "Representation learning" },
      { id: "poisson-factorisation", label: "Poisson factorisation" },
      { id: "sequence-encoders", label: "Sequence encoders" },
      { id: "concept-bottlenecks", label: "Concept bottlenecks" },
      { id: "explainable-boosting-machines", label: "Explainable boosting machines" },
    ]
  },
  {
    href: "/saas/actions",
    label: "Decisions",
    subItems: [
      { id: "crossing-the-boundary", label: "Crossing the boundary" },
      { id: "canonical-actions", label: "Canonical actions" },
      { id: "identification", label: "Identification" },
      { id: "randomized-assignment", label: "Randomized assignment" },
      { id: "quasi-random-assignment", label: "" },
      { id: "targeted-assignment", label: "" },
    ]
  },
  { 
    href: "/saas/decentralisation", 
    label: "Incentives",
    subItems: [
      { id: "the-credit-assignment-problem", label: "Credit assignment" },
      { id: "the-gold-standard-counterfactual-baselines", label: "Counterfactual baselines" },
      { id: "why-this-is-hard-in-practice", label: "Why it's hard" },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <aside className="tools-sidebar">
      <div className="sidebar-header">
        <span className="meta">SaaS</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = isActive || expandedItems.has(item.href);

          return (
            <div key={item.href} className="nav-item-group">
              <div className="nav-item-row">
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </Link>
                {hasSubItems && (
                  <button
                    className={`expand-btn ${isExpanded ? "expanded" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpanded(item.href);
                    }}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
              </div>
              {hasSubItems && isExpanded && (
                <div className="sub-items">
                  {item.subItems!.map((sub) => (
                    <a
                      key={sub.id}
                      href={`${item.href}#${sub.id}`}
                      className="sub-link"
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <style jsx>{`
        .nav-item-group {
          display: flex;
          flex-direction: column;
        }

        .nav-item-row {
          display: flex;
          align-items: center;
        }

        .nav-item-row :global(.sidebar-link) {
          flex: 1;
        }

        .expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .expand-btn:hover {
          background: var(--border);
          color: var(--fg);
        }

        .expand-btn.expanded {
          transform: rotate(180deg);
        }

        .sub-items {
          display: flex;
          flex-direction: column;
          padding-left: var(--space-4);
          margin-top: 2px;
          margin-bottom: var(--space-2);
        }

        .sub-link {
          display: block;
          padding: 4px var(--space-3);
          font-size: 12px;
          color: var(--muted);
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .sub-link:hover {
          color: var(--fg);
          background: var(--border);
          text-decoration: none;
        }
      `}</style>
    </aside>
  );
}
