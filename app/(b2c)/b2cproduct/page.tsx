"use client";

import { 
  Calculator,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from "lucide-react";

export default function B2CProductPage() {
  return (
    <div className="b2c-overview">
      <header className="overview-header">
        <div className="header-icon">
          <ShoppingCart size={32} />
        </div>
        <h1>B2C Product Analytics</h1>
        <p className="subtitle">
          Consumer-focused analytics for acquisition, monetization, and retention.
          Coming soon.
        </p>
      </header>

      <div className="coming-soon-grid">
        <div className="coming-soon-card">
          <Users size={24} />
          <h3>Acquisition</h3>
          <p>Customer acquisition cost optimization, channel mix modeling, and cohort analysis.</p>
        </div>
        <div className="coming-soon-card">
          <DollarSign size={24} />
          <h3>Monetization</h3>
          <p>Price elasticity, bundle optimization, and lifetime value modeling.</p>
        </div>
        <div className="coming-soon-card">
          <TrendingUp size={24} />
          <h3>Retention</h3>
          <p>Churn prediction, engagement scoring, and reactivation campaigns.</p>
        </div>
      </div>

      <style jsx>{`
        .b2c-overview {
          padding: var(--space-6) 0;
          max-width: 900px;
        }

        .overview-header {
          text-align: center;
          margin-bottom: var(--space-10);
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

        .overview-header h1 {
          font-size: var(--h2);
          font-weight: 700;
          margin-bottom: var(--space-3);
        }

        .subtitle {
          color: var(--muted);
          font-size: 15px;
          max-width: 500px;
          margin: 0 auto;
        }

        .coming-soon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        @media (max-width: 700px) {
          .coming-soon-grid {
            grid-template-columns: 1fr;
          }
        }

        .coming-soon-card {
          padding: var(--space-5);
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          text-align: center;
        }

        .coming-soon-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: var(--space-3) 0 var(--space-2);
        }

        .coming-soon-card p {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

