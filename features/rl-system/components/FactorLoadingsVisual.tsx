"use client";

import { useState } from "react";

// Factor loadings: state factors × observations
const poissonData = {
  factors: ["State factor 1", "State factor 2", "State factor 3", "State factor 4", "State factor 5"],
  observations: ["Logins", "Sessions", "Features", "API calls", "Exports", "Invites", "Tickets", "Docs", "Settings", "Billing"],
  weights: [
    // Factor 1: Core engagement
    [0.82, 0.79, 0.71, 0.23, 0.45, 0.38, -0.12, 0.15, 0.28, 0.19],
    // Factor 2: Technical depth  
    [0.18, 0.24, 0.52, 0.89, 0.67, 0.12, 0.08, 0.73, 0.61, 0.05],
    // Factor 3: Team expansion
    [0.35, 0.41, 0.29, 0.11, 0.22, 0.91, 0.15, 0.08, 0.55, 0.72],
    // Factor 4: Support seeking
    [-0.28, -0.31, -0.19, -0.08, 0.12, 0.05, 0.94, 0.68, 0.22, -0.15],
    // Factor 5: Admin activity
    [0.12, 0.19, 0.25, 0.08, 0.15, 0.42, 0.11, 0.21, 0.88, 0.85],
  ],
};

const bernoulliData = {
  factors: ["State factor 1", "State factor 2", "State factor 3", "State factor 4", "State factor 5"],
  observations: ["SSO", "2FA", "API key", "Webhook", "Custom domain", "Team", "Billing", "Integrations", "Exports", "Audit log"],
  weights: [
    // Factor 1: Security conscious
    [0.94, 0.88, 0.42, 0.28, 0.35, 0.52, 0.61, 0.22, 0.18, 0.79],
    // Factor 2: API-first
    [0.31, 0.45, 0.92, 0.87, 0.28, 0.19, 0.55, 0.81, 0.62, 0.38],
    // Factor 3: Team-centric
    [0.68, 0.72, 0.25, 0.15, 0.42, 0.95, 0.78, 0.35, 0.28, 0.55],
    // Factor 4: Self-service
    [0.22, 0.35, 0.58, 0.42, 0.75, 0.28, 0.92, 0.48, 0.82, 0.31],
    // Factor 5: Enterprise
    [0.91, 0.85, 0.72, 0.68, 0.88, 0.82, 0.79, 0.75, 0.71, 0.95],
  ],
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
  const data = mode === "poisson" ? poissonData : bernoulliData;
  
  const cellSize = 44;
  const labelWidth = 100;
  const labelHeight = 70;
  const width = labelWidth + data.observations.length * cellSize;
  const height = labelHeight + data.factors.length * cellSize;

  return (
    <div className="heatmap-container">
      <div className="toggle-row">
        <button 
          className={`toggle-btn ${mode === "poisson" ? "active" : ""}`}
          onClick={() => setMode("poisson")}
        >
          Poisson
        </button>
        <button 
          className={`toggle-btn ${mode === "bernoulli" ? "active" : ""}`}
          onClick={() => setMode("bernoulli")}
        >
          Bernoulli
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="heatmap-svg">
        {/* Column labels (observations) */}
        {data.observations.map((obs, i) => (
          <text
            key={obs}
            x={labelWidth + i * cellSize + cellSize / 2}
            y={labelHeight - 8}
            textAnchor="end"
            fontSize="10"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
            transform={`rotate(-45, ${labelWidth + i * cellSize + cellSize / 2}, ${labelHeight - 8})`}
          >
            {obs}
          </text>
        ))}

        {/* Row labels (factors) */}
        {data.factors.map((factor, i) => (
          <text
            key={factor}
            x={labelWidth - 8}
            y={labelHeight + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
          >
            {factor}
          </text>
        ))}

        {/* Heatmap cells */}
        {data.weights.map((row, i) =>
          row.map((value, j) => (
            <g key={`${i}-${j}`}>
              <rect
                x={labelWidth + j * cellSize + 1}
                y={labelHeight + i * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={valueToColor(value)}
                rx="2"
              />
              <text
                x={labelWidth + j * cellSize + cellSize / 2}
                y={labelHeight + i * cellSize + cellSize / 2 + 3}
                textAnchor="middle"
                fontSize="9"
                fill={Math.abs(value) > 0.5 ? "white" : "var(--fg)"}
                fontFamily="var(--font-geist-mono), monospace"
              >
                {value.toFixed(2)}
              </text>
            </g>
          ))
        )}
      </svg>

      <style jsx>{`
        .heatmap-container {
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
        .heatmap-svg {
          max-width: 600px;
          width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
