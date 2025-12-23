"use client";

import Link from "next/link";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Target,
  ArrowRight,
  FlaskConical
} from "lucide-react";

const analyses = [
  {
    href: "/product/poisson",
    title: "Poisson Factorisation",
    icon: BarChart3,
    description: "Decompose customer × event counts into latent behavioral factors using non-negative matrix factorization.",
    useCase: "Discover hidden customer segments based on product usage patterns.",
  },
  {
    href: "/product/survival",
    title: "Survival Analysis",
    icon: Clock,
    description: "Fit Cox proportional hazards models to understand time-to-churn and identify risk factors.",
    useCase: "Predict which customers are at risk and when they might churn.",
  },
  {
    href: "/product/nrr",
    title: "NRR Decomposition",
    icon: TrendingUp,
    description: "Break down Net Revenue Retention into interpretable components using explainable ML.",
    useCase: "Understand what drives expansion, contraction, and retention.",
  },
  {
    href: "/product/propensity",
    title: "Propensity Model",
    icon: Target,
    description: "Score deals with win probability, expected value, and time-to-close predictions.",
    useCase: "Prioritize pipeline and forecast revenue more accurately.",
  },
];

export default function ProductOverviewPage() {
  return (
    <div className="demos-overview">
      <header className="demos-header">
        <div className="header-icon">
          <FlaskConical size={32} />
        </div>
        <h1>Analysis Demos</h1>
        <p className="subtitle">
          Upload your data and run production-grade analytics models. 
          Results are computed on-demand—no data is stored permanently.
        </p>
      </header>

      <div className="analyses-grid">
        {analyses.map((analysis) => {
          const Icon = analysis.icon;
          return (
            <Link 
              key={analysis.href} 
              href={analysis.href}
              className="analysis-card"
            >
              <div className="card-icon">
                <Icon size={24} />
              </div>
              <h2>{analysis.title}</h2>
              <p className="card-description">{analysis.description}</p>
              <p className="card-usecase">
                <strong>Use case:</strong> {analysis.useCase}
              </p>
              <span className="card-link">
                Try it <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .demos-overview {
          padding: var(--space-6) 0;
          max-width: 900px;
        }

        .demos-header {
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

        .demos-header h1 {
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

        .analyses-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        @media (max-width: 700px) {
          .analyses-grid {
            grid-template-columns: 1fr;
          }
        }

        :global(.analysis-card) {
          display: block;
          padding: var(--space-5);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }

        :global(.analysis-card:hover) {
          border-color: var(--fg);
          text-decoration: none;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 10px;
          margin-bottom: var(--space-3);
          color: var(--fg);
        }

        :global(.analysis-card) h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--fg);
        }

        .card-description {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: var(--space-3);
        }

        .card-usecase {
          font-size: 12px;
          color: var(--muted);
          padding: var(--space-2) var(--space-3);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 6px;
          margin-bottom: var(--space-3);
        }

        .card-usecase strong {
          color: var(--fg);
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 13px;
          font-weight: 500;
          color: var(--fg);
        }
      `}</style>
    </div>
  );
}

