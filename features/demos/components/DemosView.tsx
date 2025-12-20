"use client";

import { UploadDemo } from "./UploadDemo";

export function DemosView() {
  return (
    <main className="demos-page">
      <div className="container">
        <header className="page-header">
          <h1>Analysis Demos</h1>
          <p className="subtitle">
            Upload a CSV and run real analysis on your data. 
            Results are computed on-demand—no data is stored permanently.
          </p>
        </header>

        <UploadDemo />

        <section className="data-format">
          <h2>Expected Data Formats</h2>
          
          <div className="format-card">
            <h3>Poisson Factorisation</h3>
            <p>Customer × Event count matrix</p>
            <code>customer_id, logins, feature_a_uses, feature_b_uses, tickets, ...</code>
          </div>

          <div className="format-card">
            <h3>Survival Analysis</h3>
            <p>Time-to-event with censoring indicator</p>
            <code>customer_id, tenure_months, churned, feature_1, feature_2, ...</code>
          </div>

          <div className="format-card">
            <h3>NRR Decomposition</h3>
            <p>Customer state vectors with NRR outcome</p>
            <code>customer_id, usage_depth, tenure, support_health, nrr</code>
          </div>

          <div className="format-card">
            <h3>Propensity Model</h3>
            <p>Deal-level data with outcomes</p>
            <code>deal_id, stage, days_in_pipe, won, acv, days_to_close</code>
          </div>
        </section>
      </div>

      <style jsx>{`
        .demos-page {
          min-height: 100vh;
          padding: var(--space-8) var(--space-4);
        }

        .container {
          max-width: 700px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .subtitle {
          font-size: 14px;
          color: var(--muted);
          max-width: 400px;
          margin: 0 auto;
        }

        .data-format {
          margin-top: var(--space-10);
          padding-top: var(--space-8);
          border-top: 1px solid var(--border);
        }

        .data-format h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--space-4);
        }

        .format-card {
          padding: var(--space-4);
          background: var(--card-bg, #fafafa);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: var(--space-3);
        }

        .format-card h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .format-card p {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .format-card code {
          display: block;
          font-size: 11px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--fg);
          background: var(--bg);
          padding: var(--space-2);
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </main>
  );
}

