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

type IdentificationRegime = "randomized" | "quasi" | "targeted";

interface Item {
  label: string;
  description: string;
  identification: IdentificationRegime;
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
          { label: "Build", description: "new features, workflows, modules", identification: "quasi" },
          { label: "Remove", description: "deprecations, simplifications, unbundling", identification: "quasi" },
          { label: "Recompose", description: "bundling inside product, default flows, opinionated templates", identification: "quasi" },
        ],
      },
      {
        name: "User experience",
        icon: Sparkles,
        items: [
          { label: "Improve onboarding", description: "guided setup, checklists, tours, templates, sample data", identification: "randomized" },
          { label: "Fix information architecture", description: "navigation, labels, depth, global search/command palette", identification: "quasi" },
          { label: "Simplify core flows", description: "remove steps, obvious primary actions, defaults, bulk edit", identification: "randomized" },
          { label: "Improve affordances and feedback", description: "empty states, inline validation, progress indicators, optimistic UI", identification: "randomized" },
          { label: "Reduce cognitive load", description: "progressive disclosure, templates/presets, standardized patterns", identification: "randomized" },
        ],
      },
      {
        name: "Reliability",
        icon: Activity,
        items: [
          { label: "Improve availability", description: "uptime, outage minutes, error-rate, successful request ratio", identification: "quasi" },
          { label: "Improve resilience and recovery", description: "incident frequency, blast radius, MTTR, rollback quality, graceful degradation", identification: "quasi" },
          { label: "Improve performance", description: "latency (p95/p99), throughput, tail behavior under load, rate-limit behavior", identification: "quasi" },
          { label: "Improve correctness and integrity", description: "data accuracy, sync correctness, consistency, duplication/loss, idempotency", identification: "quasi" },
          { label: "Improve durability and continuity", description: "backups, restore tests, disaster recovery, RPO/RTO", identification: "quasi" },
        ],
      },
      {
        name: "Trust & security",
        icon: Lock,
        items: [
          { label: "Add security controls", description: "SSO, MFA, RBAC, audit logs", identification: "quasi" },
          { label: "Publish compliance certifications", description: "SOC2, ISO, HIPAA badges, data residency options", identification: "quasi" },
          { label: "Implement privacy controls", description: "retention, deletion, consent controls", identification: "quasi" },
        ],
      },
      {
        name: "Integrations & extensibility",
        icon: Plug,
        items: [
          { label: "Build APIs/SDKs", description: "endpoints, rate limits, auth", identification: "quasi" },
          { label: "Build connectors", description: "warehouse, CRM, billing, identity", identification: "quasi" },
          { label: "Expand marketplace surface", description: "app listings, install paths", identification: "quasi" },
          { label: "Enable migration", description: "import/export, mapping, backfills", identification: "quasi" },
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
          { label: "Add/remove packages", description: "tiers, editions, SKUs", identification: "quasi" },
          { label: "Add/remove base platform", description: "core offering, platform fee", identification: "quasi" },
          { label: "Add/remove add-ons", description: "modules, feature packs, premium features", identification: "quasi" },
          { label: "Add/remove GBB constraint", description: "good/better/best fencing, upgrade paths", identification: "quasi" },
        ],
      },
      {
        name: "Product configuration",
        icon: Blocks,
        items: [
          { label: "Move feature up/down", description: "reposition in tier hierarchy", identification: "quasi" },
          { label: "Add/remove package from platform", description: "bundle composition", identification: "quasi" },
          { label: "Add/remove feature as add-on", description: "unbundle or rebundle capabilities", identification: "quasi" },
        ],
      },
      {
        name: "Price metric",
        icon: Gauge,
        items: [
          { label: "Add price metric", description: "seats, usage, outcomes, API calls", identification: "quasi" },
          { label: "Remove price metric", description: "simplify pricing dimensions", identification: "quasi" },
        ],
      },
      {
        name: "Price model",
        icon: Activity,
        items: [
          { label: "Add/remove base fee", description: "platform fee, minimum commit", identification: "quasi" },
          { label: "Add/remove usage allowance", description: "included units, pooled credits", identification: "quasi" },
          { label: "Add/remove cap", description: "spend limits, usage ceilings", identification: "quasi" },
          { label: "Change marginal rate shape", description: "flat, tiered, volume, step-down", identification: "quasi" },
        ],
      },
      {
        name: "Price level",
        icon: DollarSign,
        items: [
          { label: "Increase price level", description: "raise rates, reduce discounts", identification: "quasi" },
          { label: "Decrease price level", description: "lower rates, increase discounts", identification: "targeted" },
        ],
      },
      {
        name: "Freemium strategy",
        icon: Sparkles,
        items: [
          { label: "Add/remove freemium", description: "faux free, perpetual free tier", identification: "quasi" },
          { label: "Add/remove free trial", description: "time-based, usage-based trials", identification: "randomized" },
        ],
      },
      {
        name: "Deal mechanics",
        icon: Percent,
        items: [
          { label: "Offer discounts", description: "volume, term, promo codes, negotiated", identification: "targeted" },
          { label: "Offer credits", description: "usage credits, implementation credits", identification: "targeted" },
          { label: "Offer guarantees", description: "refund terms, performance guarantees", identification: "quasi" },
        ],
      },
      {
        name: "Contract structure",
        icon: FileText,
        items: [
          { label: "Set term length", description: "monthly/annual/multi-year", identification: "targeted" },
          { label: "Configure billing", description: "upfront, net terms, invoicing, PO support", identification: "targeted" },
          { label: "Configure renewal", description: "auto-renew, true-ups, ramp schedules", identification: "targeted" },
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
          { label: "Change targeting settings", description: "vertical, region, company size, ICP criteria", identification: "quasi" },
          { label: "Increase/decrease channel spend", description: "paid ads, outbound, SEO, marketplace listing", identification: "quasi" },
          { label: "Add/remove partner", description: "resellers, integrators, referral partners", identification: "quasi" },
          { label: "Improve copy", description: "headlines, CTAs, email subject lines, ad text", identification: "randomized" },
          { label: "Improve creative", description: "images, videos, landing page design", identification: "randomized" },
        ],
      },
      {
        name: "Brand marketing",
        icon: Palette,
        items: [
          { label: "Change targeting settings", description: "audience, persona, awareness segments", identification: "quasi" },
          { label: "Increase/decrease channel spend", description: "sponsorships, events, PR, content syndication", identification: "quasi" },
          { label: "Improve copy", description: "messaging, tone, narrative, taglines", identification: "randomized" },
          { label: "Improve creative", description: "brand visuals, video content, event materials", identification: "randomized" },
        ],
      },
      {
        name: "Pre-sale lifecycle",
        icon: Bell,
        items: [
          { label: "Send lead nurture", description: "drip sequences, newsletters, educational emails", identification: "randomized" },
          { label: "Offer lead magnets", description: "guides, templates, webinars, free tools", identification: "randomized" },
          { label: "Run retargeting", description: "abandoned cart, site visitors, engaged leads", identification: "randomized" },
        ],
      },
      {
        name: "Sales motion",
        icon: Handshake,
        items: [
          { label: "Send outreach", description: "cold emails, sequences, ABM touches", identification: "targeted" },
          { label: "Qualify leads", description: "scoring, BANT/MEDDIC, disqualification", identification: "targeted" },
          { label: "Run demos", description: "discovery calls, product walkthroughs", identification: "targeted" },
          { label: "Manage trials/POCs", description: "setup, check-ins, success criteria", identification: "targeted" },
          { label: "Deliver proposals", description: "quotes, contracts, procurement docs, security reviews", identification: "targeted" },
        ],
      },
      {
        name: "Post-sale lifecycle",
        icon: Bell,
        items: [
          { label: "Send activation nudges", description: "in-product prompts, email, push", identification: "randomized" },
          { label: "Send expansion prompts", description: "cross-sell, upsell, usage-based prompts", identification: "randomized" },
          { label: "Run retention motions", description: "renewal sequences, save offers, winback", identification: "targeted" },
        ],
      },
      {
        name: "Customer success",
        icon: HeartHandshake,
        items: [
          { label: "Deliver implementation", description: "kickoff calls, configuration, migration, training sessions", identification: "targeted" },
          { label: "Run business reviews", description: "QBRs, success plans, usage reports, value assessments", identification: "targeted" },
          { label: "Handle support tickets", description: "triage, escalation, incident comms, postmortems, credits", identification: "targeted" },
          { label: "Send renewal communications", description: "renewal notices, pricing updates, contract terms", identification: "quasi" },
          { label: "Pitch expansion", description: "upsell proposals, seat additions, new use cases", identification: "targeted" },
          { label: "Request references", description: "case study interviews, review requests, referral asks", identification: "targeted" },
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
                            <span className={`dot dot-${item.identification}`} />
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
      <div className="legend">
        <div className="legend-item">
          <span className="dot dot-randomized" />
          <span>Randomized</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-quasi" />
          <span>Quasi-random</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-targeted" />
          <span>Targeted</span>
        </div>
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

        .dot-randomized {
          background: #22c55e;
        }

        .dot-quasi {
          background: #eab308;
        }

        .dot-targeted {
          background: #ef4444;
        }

        .legend {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--muted);
        }

        .legend-item .dot {
          margin-top: 0;
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
