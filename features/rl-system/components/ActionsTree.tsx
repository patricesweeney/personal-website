"use client";

import { useState } from "react";
import {
  Blocks,
  Sparkles,
  Activity,
  Lock,
  Plug,
  Gauge,
  Package,
  DollarSign,
  Percent,
  FileText,
  Target,
  Palette,
  Handshake,
  Bell,
  HeartHandshake,
  LucideIcon,
} from "lucide-react";

type Advantage = "high" | "mid" | "low";

interface Item {
  label: string;
  description: string;
  advantage: Advantage;
}

interface Subcategory {
  name: string;
  icon: LucideIcon;
  items: Item[];
}

interface Category {
  name: string;
  subcategories: Subcategory[];
}

const categories: Category[] = [
  {
    name: "Product",
    subcategories: [
      {
        name: "Features",
        icon: Blocks,
        items: [
          { label: "Build", description: "new features, workflows, modules", advantage: "mid" },
          { label: "Remove", description: "deprecations, simplifications, unbundling", advantage: "high" },
          { label: "Recompose", description: "bundling inside product, default flows, opinionated templates", advantage: "high" },
        ],
      },
      {
        name: "User experience",
        icon: Sparkles,
        items: [
          { label: "Improve onboarding", description: "guided setup, checklists, tours, templates, sample data", advantage: "high" },
          { label: "Fix information architecture", description: "navigation, labels, depth, global search/command palette", advantage: "mid" },
          { label: "Simplify core flows", description: "remove steps, obvious primary actions, defaults, bulk edit", advantage: "high" },
          { label: "Improve affordances and feedback", description: "empty states, inline validation, progress indicators, optimistic UI", advantage: "mid" },
          { label: "Reduce cognitive load", description: "progressive disclosure, templates/presets, standardized patterns", advantage: "mid" },
        ],
      },
      {
        name: "Reliability",
        icon: Activity,
        items: [
          { label: "Improve availability", description: "uptime, outage minutes, error-rate, successful request ratio", advantage: "mid" },
          { label: "Improve resilience and recovery", description: "incident frequency, blast radius, MTTR, rollback quality, graceful degradation", advantage: "mid" },
          { label: "Improve performance", description: "latency (p95/p99), throughput, tail behavior under load, rate-limit behavior", advantage: "mid" },
          { label: "Improve correctness and integrity", description: "data accuracy, sync correctness, consistency, duplication/loss, idempotency", advantage: "high" },
          { label: "Improve durability and continuity", description: "backups, restore tests, disaster recovery, RPO/RTO", advantage: "mid" },
        ],
      },
      {
        name: "Trust & security",
        icon: Lock,
        items: [
          { label: "Add security controls", description: "SSO, MFA, RBAC, audit logs", advantage: "mid" },
          { label: "Publish compliance certifications", description: "SOC2, ISO, HIPAA badges, data residency options", advantage: "high" },
          { label: "Implement privacy controls", description: "retention, deletion, consent controls", advantage: "mid" },
        ],
      },
      {
        name: "Integrations & extensibility",
        icon: Plug,
        items: [
          { label: "Build APIs/SDKs", description: "endpoints, rate limits, auth", advantage: "mid" },
          { label: "Build connectors", description: "warehouse, CRM, billing, identity", advantage: "high" },
          { label: "Expand marketplace surface", description: "app listings, install paths", advantage: "mid" },
          { label: "Enable migration", description: "import/export, mapping, backfills", advantage: "high" },
        ],
      },
    ],
  },
  {
    name: "Pricing",
    subcategories: [
      {
        name: "Package structure",
        icon: Package,
        items: [
          { label: "Add/remove packages", description: "tiers, editions, SKUs", advantage: "mid" },
          { label: "Add/remove base platform", description: "core offering, platform fee", advantage: "mid" },
          { label: "Add/remove add-ons", description: "modules, feature packs, premium features", advantage: "mid" },
          { label: "Add/remove GBB constraint", description: "good/better/best fencing, upgrade paths", advantage: "high" },
        ],
      },
      {
        name: "Product configuration",
        icon: Blocks,
        items: [
          { label: "Move feature up/down", description: "reposition in tier hierarchy", advantage: "high" },
          { label: "Add/remove package from platform", description: "bundle composition", advantage: "mid" },
          { label: "Add/remove feature as add-on", description: "unbundle or rebundle capabilities", advantage: "high" },
        ],
      },
      {
        name: "Price metric",
        icon: Gauge,
        items: [
          { label: "Add price metric", description: "seats, usage, outcomes, API calls", advantage: "mid" },
          { label: "Remove price metric", description: "simplify pricing dimensions", advantage: "high" },
        ],
      },
      {
        name: "Price model",
        icon: Activity,
        items: [
          { label: "Add/remove base fee", description: "platform fee, minimum commit", advantage: "mid" },
          { label: "Add/remove usage allowance", description: "included units, pooled credits", advantage: "mid" },
          { label: "Add/remove cap", description: "spend limits, usage ceilings", advantage: "mid" },
          { label: "Change marginal rate shape", description: "flat, tiered, volume, step-down", advantage: "high" },
        ],
      },
      {
        name: "Price level",
        icon: DollarSign,
        items: [
          { label: "Increase price level", description: "raise rates, reduce discounts", advantage: "high" },
          { label: "Decrease price level", description: "lower rates, increase discounts", advantage: "low" },
        ],
      },
      {
        name: "Freemium strategy",
        icon: Sparkles,
        items: [
          { label: "Add/remove freemium", description: "faux free, perpetual free tier", advantage: "mid" },
          { label: "Add/remove free trial", description: "time-based, usage-based trials", advantage: "mid" },
        ],
      },
      {
        name: "Deal mechanics",
        icon: Percent,
        items: [
          { label: "Offer discounts", description: "volume, term, promo codes, negotiated", advantage: "low" },
          { label: "Offer credits", description: "usage credits, implementation credits", advantage: "mid" },
          { label: "Offer guarantees", description: "refund terms, performance guarantees", advantage: "high" },
        ],
      },
      {
        name: "Contract structure",
        icon: FileText,
        items: [
          { label: "Set term length", description: "monthly/annual/multi-year", advantage: "mid" },
          { label: "Configure billing", description: "upfront, net terms, invoicing, PO support", advantage: "mid" },
          { label: "Configure renewal", description: "auto-renew, true-ups, ramp schedules", advantage: "high" },
        ],
      },
    ],
  },
  {
    name: "Promotion",
    subcategories: [
      {
        name: "Performance marketing",
        icon: Target,
        items: [
          { label: "Change targeting settings", description: "vertical, region, company size, ICP criteria", advantage: "mid" },
          { label: "Increase/decrease channel spend", description: "paid ads, outbound, SEO, marketplace listing", advantage: "mid" },
          { label: "Add/remove partner", description: "resellers, integrators, referral partners", advantage: "mid" },
          { label: "Improve copy", description: "headlines, CTAs, email subject lines, ad text", advantage: "high" },
          { label: "Improve creative", description: "images, videos, landing page design", advantage: "mid" },
        ],
      },
      {
        name: "Brand marketing",
        icon: Palette,
        items: [
          { label: "Change targeting settings", description: "audience, persona, awareness segments", advantage: "mid" },
          { label: "Increase/decrease channel spend", description: "sponsorships, events, PR, content syndication", advantage: "mid" },
          { label: "Improve copy", description: "messaging, tone, narrative, taglines", advantage: "high" },
          { label: "Improve creative", description: "brand visuals, video content, event materials", advantage: "mid" },
        ],
      },
      {
        name: "Pre-sale lifecycle",
        icon: Bell,
        items: [
          { label: "Send lead nurture", description: "drip sequences, newsletters, educational emails", advantage: "high" },
          { label: "Offer lead magnets", description: "guides, templates, webinars, free tools", advantage: "high" },
          { label: "Run retargeting", description: "abandoned cart, site visitors, engaged leads", advantage: "mid" },
        ],
      },
      {
        name: "Sales motion",
        icon: Handshake,
        items: [
          { label: "Send outreach", description: "cold emails, sequences, ABM touches", advantage: "mid" },
          { label: "Qualify leads", description: "scoring, BANT/MEDDIC, disqualification", advantage: "mid" },
          { label: "Run demos", description: "discovery calls, product walkthroughs", advantage: "mid" },
          { label: "Manage trials/POCs", description: "setup, check-ins, success criteria", advantage: "mid" },
          { label: "Deliver proposals", description: "quotes, contracts, procurement docs, security reviews", advantage: "mid" },
        ],
      },
      {
        name: "Post-sale lifecycle",
        icon: Bell,
        items: [
          { label: "Send activation nudges", description: "in-product prompts, email, push", advantage: "high" },
          { label: "Send expansion prompts", description: "cross-sell, upsell, usage-based prompts", advantage: "high" },
          { label: "Run retention motions", description: "renewal sequences, save offers, winback", advantage: "high" },
        ],
      },
      {
        name: "Customer success",
        icon: HeartHandshake,
        items: [
          { label: "Deliver implementation", description: "kickoff calls, configuration, migration, training sessions", advantage: "mid" },
          { label: "Run business reviews", description: "QBRs, success plans, usage reports, value assessments", advantage: "high" },
          { label: "Handle support tickets", description: "triage, escalation, incident comms, postmortems, credits", advantage: "mid" },
          { label: "Send renewal communications", description: "renewal notices, pricing updates, contract terms", advantage: "mid" },
          { label: "Pitch expansion", description: "upsell proposals, seat additions, new use cases", advantage: "high" },
          { label: "Request references", description: "case study interviews, review requests, referral asks", advantage: "high" },
        ],
      },
    ],
  },
];

export function ActionsTree() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="tree">
      <div className="categories">
        {categories.map((cat) => (
          <div key={cat.name} className="category">
            <div className="category-header">{cat.name}</div>
            <div className="subcategories">
              {cat.subcategories.map((sub) => {
                const key = `${cat.name}-${sub.name}`;
                const isOpen = expanded[key] ?? false;
                return (
                  <div key={sub.name} className="subcategory">
                    <button
                      className="subcategory-btn"
                      onClick={() => toggle(key)}
                      title={sub.name}
                    >
                      <sub.icon size={14} />
                      {sub.name}
                      <span className="toggle">{isOpen ? "−" : "+"}</span>
                    </button>
                    <div className={`items-wrapper ${isOpen ? "open" : ""}`}>
                      <div className="items-inner">
                        {sub.items.map((item) => (
                          <div key={item.label} className="item" title={item.description}>
                            <span className={`dot dot-${item.advantage}`} />
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
          </div>
        ))}
      </div>

      <style jsx>{`
        .tree {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
        }

        .categories {
          display: flex;
          flex-direction: row;
          gap: 32px;
        }

        .category {
          flex: 1;
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
          flex-direction: column;
          gap: 8px;
        }

        .subcategory {
          display: flex;
          flex-direction: column;
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

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        .dot-high {
          background: #22c55e;
        }

        .dot-mid {
          background: #eab308;
        }

        .dot-low {
          background: #ef4444;
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
