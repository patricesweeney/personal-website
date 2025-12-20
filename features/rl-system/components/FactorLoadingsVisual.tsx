"use client";

import { useState } from "react";

// Factor loadings: factors × observations
const poissonData = {
  factors: ["Factor 1", "Factor 2", "Factor 3"],
  observations: ["Logins", "Features", "API", "Integrations", "Tickets", "Docs"],
  weights: [
    [0.85, 0.78, 0.72, 0.65, -0.15, 0.25],   // Factor 1
    [-0.45, -0.62, -0.38, -0.22, 0.88, 0.55], // Factor 2
    [0.35, 0.42, 0.15, 0.68, 0.32, 0.82],     // Factor 3
  ],
};

const bernoulliData = {
  factors: ["Factor 1", "Factor 2", "Factor 3"],
  observations: ["SSO", "Billing", "Team", "API", "Webhooks", "Domain"],
  weights: [
    [0.92, 0.88, 0.75, 0.45, 0.28, 0.18],   // Factor 1
    [0.35, 0.65, 0.22, 0.95, 0.85, 0.42],   // Factor 2
    [0.98, 0.95, 0.92, 0.78, 0.72, 0.88],   // Factor 3
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
  
  const cellSize = 50;
  const labelWidth = 70;
  const labelHeight = 60;
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
            textAnchor="middle"
            fontSize="11"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
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
            fontSize="11"
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
                x={labelWidth + j * cellSize}
                y={labelHeight + i * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={valueToColor(value)}
                rx="3"
              />
              <text
                x={labelWidth + j * cellSize + cellSize / 2 - 1}
                y={labelHeight + i * cellSize + cellSize / 2 + 4}
                textAnchor="middle"
                fontSize="10"
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
          max-width: 450px;
          width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
