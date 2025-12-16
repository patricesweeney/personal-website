"use client";

import { useState } from "react";
import {
  Activity,
  CreditCard,
  Users,
  Headphones,
  ClipboardList,
  MessageSquare,
  Phone,
  Building2,
  TrendingUp,
  MousePointer,
  Heart,
  Globe,
  LucideIcon,
} from "lucide-react";

interface Item {
  label: string;
  description: string;
  icon: LucideIcon;
}

interface Subcategory {
  name: string;
  icon: LucideIcon;
  items: Item[];
}

const subcategories: Subcategory[] = [
  {
    name: "Behavioral",
    icon: MousePointer,
    items: [
      { label: "Product instrumentation", description: "events, sessions, usage persistence", icon: Activity },
      { label: "Transactions", description: "billing, payments, renewals, expansions", icon: CreditCard },
      { label: "CRM & lifecycle", description: "touches, stages, campaigns", icon: Users },
      { label: "Support operations", description: "tickets, SLA breaches, incident exposure", icon: Headphones },
    ],
  },
  {
    name: "Attitudinal",
    icon: Heart,
    items: [
      { label: "Surveys", description: "NPS, CSAT, custom questionnaires", icon: ClipboardList },
      { label: "Interviews", description: "customer discovery, win/loss analysis", icon: MessageSquare },
      { label: "Call transcripts", description: "sales calls, support calls, CS check-ins", icon: Phone },
    ],
  },
  {
    name: "Third party",
    icon: Globe,
    items: [
      { label: "Firmographic enrichment", description: "industry, size, tech stack, growth stage", icon: Building2 },
      { label: "User enrichment", description: "role, seniority, contact info", icon: Users },
      { label: "Desk research", description: "competitor intel, market trends", icon: TrendingUp },
    ],
  },
];

export function ObservationsMindMap() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Behavioral: true,
    Attitudinal: true,
    "Third party": true,
  });

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="tree">
      <div className="category-header">Observations</div>
      <div className="subcategories">
        {subcategories.map((sub) => {
          const isOpen = expanded[sub.name] ?? false;
          return (
            <div key={sub.name} className="subcategory">
              <button
                className="subcategory-btn"
                onClick={() => toggle(sub.name)}
              >
                <sub.icon size={14} />
                {sub.name}
                <span className="toggle">{isOpen ? "−" : "+"}</span>
              </button>
              <div className={`items-wrapper ${isOpen ? "open" : ""}`}>
                <div className="items-inner">
                  {sub.items.map((item) => (
                    <div key={item.label} className="item" title={item.description}>
                      <item.icon size={12} className="item-icon" />
                      <div className="item-content">
                        <span className="item-label">{item.label}</span>
                        <span className="item-desc">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .tree {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
        }

        .category-header {
          font-weight: 700;
          font-size: 15px;
          padding: 10px 16px;
          background: var(--fg);
          color: var(--bg);
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 16px;
        }

        .subcategories {
          display: flex;
          flex-direction: row;
          gap: 32px;
        }

        .subcategory {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .subcategory-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          font-size: 13px;
          padding: 6px 12px;
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          width: fit-content;
        }

        .subcategory-btn:hover {
          background: var(--fg);
          color: var(--bg);
          border-color: var(--fg);
        }

        .toggle {
          font-family: monospace;
          font-size: 14px;
          margin-left: auto;
          opacity: 0.5;
        }

        .items-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.2s ease;
          margin-left: 12px;
        }

        .items-wrapper.open {
          grid-template-rows: 1fr;
        }

        .items-inner {
          overflow: hidden;
        }

        .item {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          padding: 4px 10px;
          margin: 2px 0;
          color: var(--fg);
          border-radius: 4px;
          cursor: default;
          transition: all 0.15s ease;
        }

        .item:hover {
          background: color-mix(in srgb, var(--fg) 6%, transparent);
        }

        .item-content {
          display: flex;
          flex-direction: column;
        }

        .item-label {
          font-weight: 500;
          opacity: 0.9;
        }

        .item-desc {
          opacity: 0.5;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
