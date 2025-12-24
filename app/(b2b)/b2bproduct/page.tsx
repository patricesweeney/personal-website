"use client";

import { useState, useMemo } from "react";
import { 
  Calculator,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Target,
  Filter,
  Zap,
  Package,
  Tags,
  Layers,
  ArrowUpRight,
  Heart,
  Info,
  UserCheck
} from "lucide-react";

interface BusinessMetrics {
  // Core metrics
  customers: number;
  monthlyArpu: number;
  annualChurnRate: number;
  monthlyNewCustomers: number;
  cac: number;
  grossMargin: number;
  
  // Baseline rates
  leadConversionRate: number;
  activationRate: number;
  expansionRate: number;
}

interface FeatureImpact {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: "acquisition" | "monetization" | "nrr";
  lever: string;
  leverDescription: string;
  baselineMetric: keyof BusinessMetrics;
  impactType: "multiplier" | "reduction" | "increase";
  defaultUplift: number;
  maxUplift: number;
  computeImpact: (metrics: BusinessMetrics, uplift: number) => number;
}

const features: FeatureImpact[] = [
  // Acquisition
  {
    id: "icp-identification",
    name: "ICP identification",
    icon: <UserCheck size={18} />,
    category: "acquisition",
    lever: "Customer Quality",
    leverDescription: "Target highest-LTV customer profiles, improving unit economics",
    baselineMetric: "cac",
    impactType: "reduction",
    defaultUplift: 20,
    maxUplift: 50,
    computeImpact: (metrics, uplift) => {
      // Better ICP = higher LTV customers at similar CAC
      const ltvIncrease = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate * (uplift / 100) * 0.3;
      const annualNewCustomers = metrics.monthlyNewCustomers * 12;
      return ltvIncrease * annualNewCustomers;
    },
  },
  {
    id: "channel-attribution",
    name: "Channel attribution",
    icon: <PieChart size={18} />,
    category: "acquisition",
    lever: "CAC Efficiency",
    leverDescription: "Reallocate spend to highest-ROI channels, reducing blended CAC",
    baselineMetric: "cac",
    impactType: "reduction",
    defaultUplift: 15,
    maxUplift: 40,
    computeImpact: (metrics, uplift) => {
      const cacReduction = metrics.cac * (uplift / 100);
      const annualNewCustomers = metrics.monthlyNewCustomers * 12;
      return cacReduction * annualNewCustomers;
    },
  },
  {
    id: "lead-scoring",
    name: "Lead scoring",
    icon: <Target size={18} />,
    category: "acquisition",
    lever: "Conversion Rate",
    leverDescription: "Focus sales effort on high-probability leads, improving win rate",
    baselineMetric: "leadConversionRate",
    impactType: "multiplier",
    defaultUplift: 20,
    maxUplift: 50,
    computeImpact: (metrics, uplift) => {
      const additionalConversions = metrics.monthlyNewCustomers * (uplift / 100);
      const ltv = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate;
      return additionalConversions * 12 * (ltv - metrics.cac);
    },
  },
  {
    id: "sales-funnel",
    name: "Sales funnel analysis",
    icon: <Filter size={18} />,
    category: "acquisition",
    lever: "Pipeline Velocity",
    leverDescription: "Reduce time-to-close and improve stage conversion rates",
    baselineMetric: "leadConversionRate",
    impactType: "multiplier",
    defaultUplift: 10,
    maxUplift: 30,
    computeImpact: (metrics, uplift) => {
      // Faster velocity = more deals closed per period + working capital benefit
      const additionalDeals = metrics.monthlyNewCustomers * (uplift / 100) * 0.5;
      const ltv = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate;
      return additionalDeals * 12 * (ltv - metrics.cac);
    },
  },
  // Monetization
  {
    id: "activation-drivers",
    name: "Activation drivers",
    icon: <Zap size={18} />,
    category: "monetization",
    lever: "Activation Rate",
    leverDescription: "More signups reach 'aha moment' and convert to paying",
    baselineMetric: "activationRate",
    impactType: "multiplier",
    defaultUplift: 15,
    maxUplift: 40,
    computeImpact: (metrics, uplift) => {
      const baseActivated = metrics.monthlyNewCustomers * metrics.activationRate;
      const newActivated = metrics.monthlyNewCustomers * (metrics.activationRate * (1 + uplift / 100));
      const additionalActivated = newActivated - baseActivated;
      const ltv = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate;
      return additionalActivated * 12 * ltv;
    },
  },
  {
    id: "packaging",
    name: "Packaging",
    icon: <Package size={18} />,
    category: "monetization",
    lever: "ARPU (Mix Shift)",
    leverDescription: "Optimize feature bundles to drive upgrades to higher tiers",
    baselineMetric: "monthlyArpu",
    impactType: "increase",
    defaultUplift: 8,
    maxUplift: 25,
    computeImpact: (metrics, uplift) => {
      const arpuIncrease = metrics.monthlyArpu * (uplift / 100);
      return metrics.customers * arpuIncrease * 12 * metrics.grossMargin;
    },
  },
  {
    id: "pricing",
    name: "Pricing",
    icon: <Tags size={18} />,
    category: "monetization",
    lever: "ARPU (Price)",
    leverDescription: "Capture more willingness-to-pay through optimized pricing",
    baselineMetric: "monthlyArpu",
    impactType: "increase",
    defaultUplift: 5,
    maxUplift: 20,
    computeImpact: (metrics, uplift) => {
      const arpuIncrease = metrics.monthlyArpu * (uplift / 100);
      return metrics.customers * arpuIncrease * 12 * metrics.grossMargin;
    },
  },
  // NRR
  {
    id: "use-cases",
    name: "Use cases",
    icon: <Layers size={18} />,
    category: "nrr",
    lever: "Segment Targeting",
    leverDescription: "Identify high-value segments for retention and expansion focus",
    baselineMetric: "annualChurnRate",
    impactType: "reduction",
    defaultUplift: 5,
    maxUplift: 15,
    computeImpact: (metrics, uplift) => {
      // Better targeting reduces churn in addressable segment
      const churnReduction = metrics.annualChurnRate * (uplift / 100);
      const retainedCustomers = metrics.customers * churnReduction;
      const ltv = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate;
      return retainedCustomers * ltv * 0.5; // Discount for partial year
    },
  },
  {
    id: "expansion-drivers",
    name: "Expansion drivers",
    icon: <ArrowUpRight size={18} />,
    category: "nrr",
    lever: "Expansion Revenue",
    leverDescription: "Identify and act on upsell/cross-sell opportunities",
    baselineMetric: "expansionRate",
    impactType: "multiplier",
    defaultUplift: 20,
    maxUplift: 50,
    computeImpact: (metrics, uplift) => {
      const baseExpansion = metrics.customers * metrics.expansionRate * metrics.monthlyArpu * 0.3;
      const additionalExpansion = baseExpansion * (uplift / 100);
      return additionalExpansion * 12 * metrics.grossMargin;
    },
  },
  {
    id: "retention-drivers",
    name: "Retention drivers",
    icon: <Heart size={18} />,
    category: "nrr",
    lever: "Churn Rate",
    leverDescription: "Identify at-risk customers and intervene before they churn",
    baselineMetric: "annualChurnRate",
    impactType: "reduction",
    defaultUplift: 15,
    maxUplift: 40,
    computeImpact: (metrics, uplift) => {
      const churnReduction = metrics.annualChurnRate * (uplift / 100);
      const retainedCustomers = metrics.customers * churnReduction;
      const ltv = (metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate;
      return retainedCustomers * ltv;
    },
  },
];

const defaultMetrics: BusinessMetrics = {
  customers: 1000,
  monthlyArpu: 100,
  annualChurnRate: 0.15,
  monthlyNewCustomers: 50,
  cac: 500,
  grossMargin: 0.75,
  leadConversionRate: 0.05,
  activationRate: 0.60,
  expansionRate: 0.10,
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export default function ROICalculatorPage() {
  const [metrics, setMetrics] = useState<BusinessMetrics>(defaultMetrics);
  const [uplifts, setUplifts] = useState<Record<string, number>>(
    Object.fromEntries(features.map((f) => [f.id, f.defaultUplift]))
  );
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(
    new Set(features.map((f) => f.id))
  );

  const impacts = useMemo(() => {
    return features.map((feature) => ({
      ...feature,
      impact: enabledFeatures.has(feature.id)
        ? feature.computeImpact(metrics, uplifts[feature.id])
        : 0,
    }));
  }, [metrics, uplifts, enabledFeatures]);

  const totalImpact = useMemo(() => {
    return impacts.reduce((sum, f) => sum + f.impact, 0);
  }, [impacts]);

  const baselineArr = metrics.customers * metrics.monthlyArpu * 12;
  const impactPercent = (totalImpact / baselineArr) * 100;

  const updateMetric = (key: keyof BusinessMetrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (id: string) => {
    setEnabledFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categoryImpacts = {
    acquisition: impacts.filter((f) => f.category === "acquisition").reduce((s, f) => s + f.impact, 0),
    monetization: impacts.filter((f) => f.category === "monetization").reduce((s, f) => s + f.impact, 0),
    nrr: impacts.filter((f) => f.category === "nrr").reduce((s, f) => s + f.impact, 0),
  };

  return (
    <div className="roi-page">
      <header className="roi-header">
        <div className="header-icon">
          <Calculator size={32} />
        </div>
        <h1>ROI Calculator</h1>
        <p className="subtitle">
          Model the impact of each capability on your customer equity.
          Adjust your baseline metrics and expected uplifts to see projected annual value.
        </p>
      </header>

      <div className="roi-layout">
        <aside className="metrics-panel">
          <h2>Your SaaS Metrics</h2>
          
          <div className="metric-group">
            <h3><Users size={14} /> Customer Base</h3>
            <label>
              <span>Current Customers</span>
              <input
                type="number"
                value={metrics.customers}
                onChange={(e) => updateMetric("customers", Number(e.target.value))}
              />
            </label>
            <label>
              <span>Monthly New Customers</span>
              <input
                type="number"
                value={metrics.monthlyNewCustomers}
                onChange={(e) => updateMetric("monthlyNewCustomers", Number(e.target.value))}
              />
            </label>
            <label>
              <span>CAC ($)</span>
              <input
                type="number"
                value={metrics.cac}
                onChange={(e) => updateMetric("cac", Number(e.target.value))}
              />
            </label>
          </div>

          <div className="metric-group">
            <h3><DollarSign size={14} /> Revenue</h3>
            <label>
              <span>Monthly ARPU ($)</span>
              <input
                type="number"
                value={metrics.monthlyArpu}
                onChange={(e) => updateMetric("monthlyArpu", Number(e.target.value))}
              />
            </label>
            <label>
              <span>Gross Margin (%)</span>
              <input
                type="number"
                value={metrics.grossMargin * 100}
                onChange={(e) => updateMetric("grossMargin", Number(e.target.value) / 100)}
              />
            </label>
          </div>

          <div className="metric-group">
            <h3><TrendingUp size={14} /> Retention & Growth</h3>
            <label>
              <span>Annual Churn Rate (%)</span>
              <input
                type="number"
                value={metrics.annualChurnRate * 100}
                onChange={(e) => updateMetric("annualChurnRate", Number(e.target.value) / 100)}
              />
            </label>
            <label>
              <span>Lead → Customer (%)</span>
              <input
                type="number"
                value={metrics.leadConversionRate * 100}
                onChange={(e) => updateMetric("leadConversionRate", Number(e.target.value) / 100)}
              />
            </label>
            <label>
              <span>Activation Rate (%)</span>
              <input
                type="number"
                value={metrics.activationRate * 100}
                onChange={(e) => updateMetric("activationRate", Number(e.target.value) / 100)}
              />
            </label>
            <label>
              <span>Expansion Rate (%/yr)</span>
              <input
                type="number"
                value={metrics.expansionRate * 100}
                onChange={(e) => updateMetric("expansionRate", Number(e.target.value) / 100)}
              />
            </label>
          </div>

          <div className="baseline-summary">
            <div className="summary-row">
              <span>Baseline ARR</span>
              <strong>{formatCurrency(baselineArr)}</strong>
            </div>
            <div className="summary-row">
              <span>LTV</span>
              <strong>{formatCurrency((metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate)}</strong>
            </div>
            <div className="summary-row">
              <span>LTV:CAC</span>
              <strong>{((metrics.monthlyArpu * 12 * metrics.grossMargin) / metrics.annualChurnRate / metrics.cac).toFixed(1)}x</strong>
            </div>
          </div>
        </aside>

        <main className="features-panel">
          <div className="total-impact">
            <div className="total-value">
              <span className="label">Projected Annual Impact</span>
              <span className="value">{formatCurrency(totalImpact)}</span>
              <span className="percent">+{impactPercent.toFixed(1)}% of ARR</span>
            </div>
            <div className="category-breakdown">
              <div className="category-bar">
                <div 
                  className="bar-segment acquisition" 
                  style={{ flex: categoryImpacts.acquisition }}
                  title={`Acquisition: ${formatCurrency(categoryImpacts.acquisition)}`}
                />
                <div 
                  className="bar-segment monetization" 
                  style={{ flex: categoryImpacts.monetization }}
                  title={`Monetization: ${formatCurrency(categoryImpacts.monetization)}`}
                />
                <div 
                  className="bar-segment nrr" 
                  style={{ flex: categoryImpacts.nrr }}
                  title={`NRR: ${formatCurrency(categoryImpacts.nrr)}`}
                />
              </div>
              <div className="category-labels">
                <span><span className="dot acquisition" /> Acquisition {formatCurrency(categoryImpacts.acquisition)}</span>
                <span><span className="dot monetization" /> Monetization {formatCurrency(categoryImpacts.monetization)}</span>
                <span><span className="dot nrr" /> NRR {formatCurrency(categoryImpacts.nrr)}</span>
              </div>
            </div>
          </div>

          {(["acquisition", "monetization", "nrr"] as const).map((category) => (
            <div key={category} className="feature-category">
              <h3 className={`category-title ${category}`}>
                {category === "acquisition" && <><Users size={16} /> Acquisition</>}
                {category === "monetization" && <><DollarSign size={16} /> Monetization</>}
                {category === "nrr" && <><TrendingUp size={16} /> NRR</>}
              </h3>
              <div className="feature-list">
                {impacts
                  .filter((f) => f.category === category)
                  .map((feature) => (
                    <div 
                      key={feature.id} 
                      className={`feature-card ${enabledFeatures.has(feature.id) ? "enabled" : "disabled"}`}
                    >
                      <div className="feature-header">
                        <label className="feature-toggle">
                          <input
                            type="checkbox"
                            checked={enabledFeatures.has(feature.id)}
                            onChange={() => toggleFeature(feature.id)}
                          />
                          <span className="feature-icon">{feature.icon}</span>
                          <span className="feature-name">{feature.name}</span>
                        </label>
                        <span className="feature-impact">
                          {enabledFeatures.has(feature.id) ? formatCurrency(feature.impact) : "—"}
                        </span>
                      </div>
                      
                      <div className="feature-lever">
                        <span className="lever-name">{feature.lever}</span>
                        <span className="lever-desc">
                          <Info size={12} /> {feature.leverDescription}
                        </span>
                      </div>

                      {enabledFeatures.has(feature.id) && (
                        <div className="uplift-control">
                          <span className="uplift-label">
                            {feature.impactType === "reduction" ? "Reduction" : "Uplift"}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={feature.maxUplift}
                            value={uplifts[feature.id]}
                            onChange={(e) =>
                              setUplifts((prev) => ({
                                ...prev,
                                [feature.id]: Number(e.target.value),
                              }))
                            }
                          />
                          <span className="uplift-value">{uplifts[feature.id]}%</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </main>
      </div>

      <style jsx>{`
        .roi-page {
          padding: var(--space-6) 0;
          max-width: 1200px;
        }

        .roi-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: var(--fg);
          color: var(--bg);
          border-radius: 16px;
          margin-bottom: var(--space-4);
        }

        .roi-header h1 {
          font-size: var(--h2);
          font-weight: 700;
          margin-bottom: var(--space-3);
        }

        .subtitle {
          color: var(--muted);
          font-size: 15px;
          max-width: 600px;
          margin: 0 auto;
        }

        .roi-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-6);
        }

        @media (max-width: 900px) {
          .roi-layout {
            grid-template-columns: 1fr;
          }
        }

        .metrics-panel {
          background: rgba(0,0,0,0.02);
          border-radius: 12px;
          padding: var(--space-5);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .metrics-panel h2 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-4);
        }

        .metric-group {
          margin-bottom: var(--space-5);
        }

        .metric-group h3 {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          margin-bottom: var(--space-3);
        }

        .metric-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .metric-group label span {
          font-size: 13px;
          color: var(--muted);
        }

        .metric-group input {
          width: 80px;
          padding: var(--space-1) var(--space-2);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 13px;
          text-align: right;
          background: var(--bg);
        }

        .metric-group input:focus {
          outline: none;
          border-color: var(--fg);
        }

        .baseline-summary {
          border-top: 1px solid var(--border);
          padding-top: var(--space-4);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-2);
          font-size: 13px;
        }

        .summary-row span {
          color: var(--muted);
        }

        .features-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .total-impact {
          background: var(--fg);
          color: var(--bg);
          border-radius: 12px;
          padding: var(--space-5);
        }

        .total-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .total-value .label {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: var(--space-1);
        }

        .total-value .value {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .total-value .percent {
          font-size: 14px;
          opacity: 0.8;
          margin-top: var(--space-1);
        }

        .category-breakdown {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .category-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          background: rgba(255,255,255,0.1);
        }

        .bar-segment {
          min-width: 4px;
        }

        .bar-segment.acquisition { background: #3b82f6; }
        .bar-segment.monetization { background: #10b981; }
        .bar-segment.nrr { background: #f59e0b; }

        .category-labels {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          font-size: 12px;
          opacity: 0.9;
        }

        .category-labels span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot.acquisition { background: #3b82f6; }
        .dot.monetization { background: #10b981; }
        .dot.nrr { background: #f59e0b; }

        .feature-category {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .category-title.acquisition { color: #3b82f6; }
        .category-title.monetization { color: #10b981; }
        .category-title.nrr { color: #f59e0b; }

        .feature-list {
          display: grid;
          gap: var(--space-3);
        }

        .feature-card {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: var(--space-4);
          transition: all 0.15s;
        }

        .feature-card.enabled {
          background: var(--bg);
        }

        .feature-card.disabled {
          opacity: 0.5;
          background: rgba(0,0,0,0.02);
        }

        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .feature-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }

        .feature-toggle input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .feature-icon {
          display: flex;
          color: var(--muted);
        }

        .feature-name {
          font-weight: 500;
        }

        .feature-impact {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--fg);
        }

        .feature-lever {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: var(--space-3);
        }

        .lever-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
        }

        .lever-desc {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          font-size: 12px;
          color: var(--muted);
          opacity: 0.8;
        }

        .uplift-control {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border);
        }

        .uplift-label {
          font-size: 12px;
          color: var(--muted);
          width: 60px;
        }

        .uplift-control input[type="range"] {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .uplift-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--fg);
          border-radius: 50%;
          cursor: pointer;
        }

        .uplift-value {
          font-size: 13px;
          font-weight: 600;
          width: 40px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
