"use client";

import { useMemo } from "react";
import { 
  CheckCircle2, 
  Layers, 
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface PoissonResult {
  processed_at: string;
  input_rows: number;
  input_columns: string[];
  type: string;
  n_factors: number;
  reconstruction_error: number;
  factor_weights: number[][];
  error?: string;
}

interface PoissonResultsProps {
  result: PoissonResult;
}

// Color scale for heatmap (light to dark)
function getHeatColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;
  // Using a nice teal/cyan gradient
  const r = Math.round(240 - intensity * 180);
  const g = Math.round(249 - intensity * 100);
  const b = Math.round(255 - intensity * 55);
  return `rgb(${r}, ${g}, ${b})`;
}

function getTextColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;
  return intensity > 0.5 ? "#fff" : "#1f2937";
}

export function PoissonResults({ result }: PoissonResultsProps) {
  // Calculate max value for color scaling
  const maxWeight = useMemo(() => {
    if (!result.factor_weights) return 1;
    return Math.max(...result.factor_weights.flat());
  }, [result.factor_weights]);

  // Get feature names (excluding customer_id type columns)
  const featureColumns = useMemo(() => {
    return result.input_columns.filter(col => 
      !col.toLowerCase().includes('id') && 
      !col.toLowerCase().includes('customer')
    );
  }, [result.input_columns]);

  // Calculate feature importance (sum across all factors)
  const featureImportance = useMemo(() => {
    if (!result.factor_weights || !featureColumns.length) return [];
    
    return featureColumns.map((col, idx) => {
      const importance = result.factor_weights.reduce((sum, factor) => {
        return sum + (factor[idx] || 0);
      }, 0);
      return { name: col, importance };
    }).sort((a, b) => b.importance - a.importance);
  }, [result.factor_weights, featureColumns]);

  // Check for error
  if (result.error) {
    return (
      <div className="results-error">
        <AlertCircle size={24} />
        <p>{result.error}</p>
      </div>
    );
  }

  return (
    <div className="poisson-results">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon success">
            <CheckCircle2 size={20} />
          </div>
          <div className="card-content">
            <span className="card-value">{result.input_rows.toLocaleString()}</span>
            <span className="card-label">Rows Processed</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon factors">
            <Layers size={20} />
          </div>
          <div className="card-content">
            <span className="card-value">{result.n_factors}</span>
            <span className="card-label">Latent Factors</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon error-metric">
            <TrendingUp size={20} />
          </div>
          <div className="card-content">
            <span className="card-value">{result.reconstruction_error.toFixed(2)}</span>
            <span className="card-label">Reconstruction Error</span>
          </div>
        </div>
      </div>

      {/* Factor Heatmap */}
      <div className="heatmap-section">
        <h3>
          <BarChart3 size={18} />
          Factor Loadings
        </h3>
        <p className="heatmap-description">
          Each row represents a latent factor. Darker cells indicate stronger contribution from that feature.
        </p>
        
        <div className="heatmap-container">
          <div className="heatmap-scroll">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th className="factor-header">Factor</th>
                  {featureColumns.map((col) => (
                    <th key={col} className="feature-header">
                      <span className="feature-name">{col}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.factor_weights.map((factor, factorIdx) => (
                  <tr key={factorIdx}>
                    <td className="factor-label">
                      <span className="factor-badge">F{factorIdx + 1}</span>
                    </td>
                    {factor.map((weight, colIdx) => (
                      <td 
                        key={colIdx}
                        className="heatmap-cell"
                        style={{
                          backgroundColor: getHeatColor(weight, maxWeight),
                          color: getTextColor(weight, maxWeight),
                        }}
                      >
                        {weight.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feature Importance Ranking */}
      <div className="importance-section">
        <h3>
          <TrendingUp size={18} />
          Feature Importance
        </h3>
        <p className="importance-description">
          Features ranked by total contribution across all factors.
        </p>
        
        <div className="importance-bars">
          {featureImportance.slice(0, 8).map((feature, idx) => {
            const maxImportance = featureImportance[0]?.importance || 1;
            const percentage = (feature.importance / maxImportance) * 100;
            
            return (
              <div key={feature.name} className="importance-row">
                <div className="importance-rank">{idx + 1}</div>
                <div className="importance-name">{feature.name}</div>
                <div className="importance-bar-container">
                  <div 
                    className="importance-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="importance-value">
                  {feature.importance.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="interpretation-section">
        <h3>How to Interpret</h3>
        <div className="interpretation-content">
          <div className="interpretation-item">
            <strong>Factors</strong> represent latent customer behaviors or segments discovered in your data.
          </div>
          <div className="interpretation-item">
            <strong>High loadings</strong> on a feature mean that factor strongly correlates with that behavior.
          </div>
          <div className="interpretation-item">
            <strong>Low reconstruction error</strong> indicates the model captures the data patterns well.
          </div>
        </div>
      </div>

      <style jsx>{`
        .poisson-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .results-error {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        @media (max-width: 600px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
        }

        .card-icon.success {
          background: #d1fae5;
          color: #059669;
        }

        .card-icon.factors {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .card-icon.error-metric {
          background: #fef3c7;
          color: #d97706;
        }

        .card-content {
          display: flex;
          flex-direction: column;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: var(--fg);
        }

        .card-label {
          font-size: 12px;
          color: var(--muted);
        }

        /* Heatmap Section */
        .heatmap-section,
        .importance-section,
        .interpretation-section {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: var(--space-5);
        }

        .heatmap-section h3,
        .importance-section h3,
        .interpretation-section h3 {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .heatmap-description,
        .importance-description {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: var(--space-4);
        }

        .heatmap-container {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .heatmap-scroll {
          overflow-x: auto;
        }

        .heatmap-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .factor-header,
        .feature-header {
          padding: var(--space-2) var(--space-3);
          background: rgba(0, 0, 0, 0.02);
          font-weight: 600;
          text-align: center;
          border-bottom: 1px solid var(--border);
        }

        .factor-header {
          width: 70px;
          text-align: left;
        }

        .feature-name {
          display: block;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .factor-label {
          padding: var(--space-2) var(--space-3);
          background: rgba(0, 0, 0, 0.02);
          border-right: 1px solid var(--border);
        }

        .factor-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--fg);
          color: var(--bg);
          border-radius: 6px;
          font-weight: 600;
          font-size: 11px;
        }

        .heatmap-cell {
          padding: var(--space-2);
          text-align: center;
          font-weight: 500;
          font-family: var(--font-geist-mono), monospace;
          transition: transform 0.1s;
          min-width: 60px;
        }

        .heatmap-cell:hover {
          transform: scale(1.05);
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Feature Importance */
        .importance-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .importance-row {
          display: grid;
          grid-template-columns: 24px 120px 1fr 60px;
          gap: var(--space-3);
          align-items: center;
          font-size: 13px;
        }

        .importance-rank {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--border);
          border-radius: 4px;
          font-weight: 600;
          font-size: 11px;
          color: var(--muted);
        }

        .importance-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .importance-bar-container {
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .importance-bar {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #0891b2);
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }

        .importance-value {
          font-family: var(--font-geist-mono), monospace;
          text-align: right;
          color: var(--muted);
        }

        /* Interpretation */
        .interpretation-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .interpretation-item {
          font-size: 13px;
          color: var(--muted);
          padding-left: var(--space-3);
          border-left: 2px solid var(--border);
        }

        .interpretation-item strong {
          color: var(--fg);
        }
      `}</style>
    </div>
  );
}

