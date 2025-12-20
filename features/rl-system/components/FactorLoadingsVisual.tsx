"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Simulated factor loadings for demonstration
const poissonFactors = [
  {
    name: "Power user",
    description: "High engagement across core features",
    loadings: [
      { feature: "Daily logins", value: 0.85 },
      { feature: "Advanced features", value: 0.78 },
      { feature: "API calls", value: 0.72 },
      { feature: "Integrations", value: 0.65 },
      { feature: "Support tickets", value: -0.15 },
      { feature: "Docs visits", value: 0.25 },
    ],
  },
  {
    name: "At-risk",
    description: "Low engagement, high support needs",
    loadings: [
      { feature: "Daily logins", value: -0.45 },
      { feature: "Advanced features", value: -0.62 },
      { feature: "API calls", value: -0.38 },
      { feature: "Integrations", value: -0.22 },
      { feature: "Support tickets", value: 0.88 },
      { feature: "Docs visits", value: 0.55 },
    ],
  },
  {
    name: "Explorer",
    description: "Trying features, not yet committed",
    loadings: [
      { feature: "Daily logins", value: 0.35 },
      { feature: "Advanced features", value: 0.42 },
      { feature: "API calls", value: 0.15 },
      { feature: "Integrations", value: 0.68 },
      { feature: "Support tickets", value: 0.32 },
      { feature: "Docs visits", value: 0.82 },
    ],
  },
];

const bernoulliFactors = [
  {
    name: "Core adopter",
    description: "Adopted essential features",
    loadings: [
      { feature: "SSO enabled", value: 0.92 },
      { feature: "Billing setup", value: 0.88 },
      { feature: "Team invited", value: 0.75 },
      { feature: "API connected", value: 0.45 },
      { feature: "Webhooks configured", value: 0.28 },
      { feature: "Custom domain", value: 0.18 },
    ],
  },
  {
    name: "API-first",
    description: "Technical integration focus",
    loadings: [
      { feature: "SSO enabled", value: 0.35 },
      { feature: "Billing setup", value: 0.65 },
      { feature: "Team invited", value: 0.22 },
      { feature: "API connected", value: 0.95 },
      { feature: "Webhooks configured", value: 0.85 },
      { feature: "Custom domain", value: 0.42 },
    ],
  },
  {
    name: "Enterprise",
    description: "Full platform adoption",
    loadings: [
      { feature: "SSO enabled", value: 0.98 },
      { feature: "Billing setup", value: 0.95 },
      { feature: "Team invited", value: 0.92 },
      { feature: "API connected", value: 0.78 },
      { feature: "Webhooks configured", value: 0.72 },
      { feature: "Custom domain", value: 0.88 },
    ],
  },
];

// Sample customers for each factor
const customersByFactor: Record<string, string[]> = {
  "Power user": ["Acme Corp", "TechStart Inc", "DataFlow Ltd"],
  "At-risk": ["OldCo Industries", "Legacy Systems", "Slow Adopters LLC"],
  "Explorer": ["NewVenture", "Curious Labs", "Beta Testers Co"],
  "Core adopter": ["Standard Corp", "Basic Plus Inc", "Essential Ltd"],
  "API-first": ["DevShop", "Automation Inc", "Integration Masters"],
  "Enterprise": ["BigCorp Global", "Fortune Co", "Mega Industries"],
};

function valueToColor(v: number): string {
  const t = (v + 1) / 2; // Map -1..1 to 0..1
  
  if (t >= 0.5) {
    const p = (t - 0.5) * 2;
    return `rgb(${Math.round(255 - p * 200)}, ${Math.round(255 - p * 60)}, ${Math.round(255 - p * 180)})`;
  } else {
    const p = t * 2;
    return `rgb(${Math.round(220 + p * 35)}, ${Math.round(80 + p * 175)}, ${Math.round(80 + p * 175)})`;
  }
}

export function FactorLoadingsVisual() {
  const [mode, setMode] = useState<"poisson" | "bernoulli">("poisson");
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);
  
  const factors = mode === "poisson" ? poissonFactors : bernoulliFactors;
  const maxAbsValue = 1;
  
  const barWidth = 120;
  const barHeight = 18;
  const labelWidth = 130;
  const factorWidth = 280;
  const gap = 24;

  return (
    <div className="factor-container">
      <div className="toggle-row">
        <button 
          className={`toggle-btn ${mode === "poisson" ? "active" : ""}`}
          onClick={() => setMode("poisson")}
        >
          Poisson (counts)
        </button>
        <button 
          className={`toggle-btn ${mode === "bernoulli" ? "active" : ""}`}
          onClick={() => setMode("bernoulli")}
        >
          Bernoulli (adoption)
        </button>
      </div>

      <div className="factors-grid">
        {factors.map((factor, factorIdx) => (
          <motion.div
            key={factor.name}
            className={`factor-card ${hoveredFactor === factor.name ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredFactor(factor.name)}
            onMouseLeave={() => setHoveredFactor(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: factorIdx * 0.1 }}
          >
            <div className="factor-header">
              <span className="factor-index">Factor {factorIdx + 1}</span>
              <h4 className="factor-name">{factor.name}</h4>
              <p className="factor-desc">{factor.description}</p>
            </div>
            
            <div className="loadings-list">
              {factor.loadings.map((loading, idx) => {
                const normalizedValue = loading.value / maxAbsValue;
                const isPositive = loading.value >= 0;
                const barWidthPx = Math.abs(normalizedValue) * barWidth;
                
                return (
                  <motion.div 
                    key={loading.feature} 
                    className="loading-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: factorIdx * 0.1 + idx * 0.03 }}
                  >
                    <span className="feature-label">{loading.feature}</span>
                    <div className="bar-container">
                      <div className="bar-center" />
                      <motion.div
                        className="bar"
                        initial={{ width: 0 }}
                        animate={{ width: barWidthPx }}
                        transition={{ delay: factorIdx * 0.1 + idx * 0.03 + 0.2, duration: 0.4 }}
                        style={{
                          backgroundColor: valueToColor(loading.value),
                          left: isPositive ? "50%" : `calc(50% - ${barWidthPx}px)`,
                        }}
                      />
                    </div>
                    <span className="loading-value">{loading.value > 0 ? "+" : ""}{loading.value.toFixed(2)}</span>
                  </motion.div>
                );
              })}
            </div>

            {hoveredFactor === factor.name && (
              <motion.div 
                className="customers-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <span className="customers-label">High scorers:</span>
                <div className="customers-list">
                  {customersByFactor[factor.name]?.map((customer) => (
                    <span key={customer} className="customer-tag">{customer}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <p className="caption">
        Each factor is a latent dimension. Loadings show how features contribute. Hover to see example customers.
      </p>

      <style jsx>{`
        .factor-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          margin: var(--space-6) 0;
        }
        .toggle-row {
          display: flex;
          gap: 4px;
          background: var(--surface);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .toggle-btn {
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--muted);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toggle-btn:hover {
          color: var(--fg);
        }
        .toggle-btn.active {
          background: var(--fg);
          color: var(--bg);
        }
        .factors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
          width: 100%;
          max-width: 900px;
        }
        .factor-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-4);
          transition: all 0.2s ease;
        }
        .factor-card.hovered {
          border-color: var(--fg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .factor-header {
          margin-bottom: var(--space-3);
        }
        .factor-index {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .factor-name {
          font-size: 16px;
          font-weight: 600;
          margin: 2px 0 4px 0;
          color: var(--fg);
        }
        .factor-desc {
          font-size: 12px;
          color: var(--muted);
          margin: 0;
        }
        .loadings-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .loading-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .feature-label {
          font-size: 12px;
          color: var(--fg);
          width: 110px;
          flex-shrink: 0;
          text-align: right;
        }
        .bar-container {
          position: relative;
          width: 120px;
          height: 14px;
          background: var(--bg);
          border-radius: 2px;
          overflow: hidden;
        }
        .bar-center {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--border);
        }
        .bar {
          position: absolute;
          top: 2px;
          height: 10px;
          border-radius: 2px;
        }
        .loading-value {
          font-size: 11px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--muted);
          width: 40px;
        }
        .customers-panel {
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border);
          overflow: hidden;
        }
        .customers-label {
          font-size: 11px;
          color: var(--muted);
          display: block;
          margin-bottom: 6px;
        }
        .customers-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .customer-tag {
          font-size: 11px;
          padding: 3px 8px;
          background: var(--bg);
          border-radius: 4px;
          color: var(--fg);
        }
        .caption {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          max-width: 500px;
        }
      `}</style>
    </div>
  );
}

