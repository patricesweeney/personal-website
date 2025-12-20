"use client";

import { useState } from "react";

// Factor loadings: state factors × observations
const poissonData = {
  factors: ["State factor 1", "State factor 2", "State factor 3", "State factor 4", "State factor 5"],
  observations: ["Logins", "Sessions", "Features", "API calls", "Exports", "Invites", "Tickets", "Docs", "Settings", "Billing"],
  weights: [
    [0.82, 0.79, 0.71, 0.23, 0.45, 0.38, -0.12, 0.15, 0.28, 0.19],
    [0.18, 0.24, 0.52, 0.89, 0.67, 0.12, 0.08, 0.73, 0.61, 0.05],
    [0.35, 0.41, 0.29, 0.11, 0.22, 0.91, 0.15, 0.08, 0.55, 0.72],
    [-0.28, -0.31, -0.19, -0.08, 0.12, 0.05, 0.94, 0.68, 0.22, -0.15],
    [0.12, 0.19, 0.25, 0.08, 0.15, 0.42, 0.11, 0.21, 0.88, 0.85],
  ],
  // Sparse version (L1 regularized)
  weightsSparse: [
    [0.85, 0.82, 0.74, 0.00, 0.42, 0.35, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.48, 0.92, 0.70, 0.00, 0.00, 0.76, 0.58, 0.00],
    [0.00, 0.38, 0.00, 0.00, 0.00, 0.94, 0.00, 0.00, 0.52, 0.75],
    [0.00, -0.28, 0.00, 0.00, 0.00, 0.00, 0.96, 0.71, 0.00, 0.00],
    [0.00, 0.00, 0.00, 0.00, 0.00, 0.39, 0.00, 0.00, 0.91, 0.88],
  ],
};

const bernoulliData = {
  factors: ["State factor 1", "State factor 2", "State factor 3", "State factor 4", "State factor 5"],
  observations: ["SSO", "2FA", "API key", "Webhook", "Custom domain", "Team", "Billing", "Integrations", "Exports", "Audit log"],
  weights: [
    [0.94, 0.88, 0.42, 0.28, 0.35, 0.52, 0.61, 0.22, 0.18, 0.79],
    [0.31, 0.45, 0.92, 0.87, 0.28, 0.19, 0.55, 0.81, 0.62, 0.38],
    [0.68, 0.72, 0.25, 0.15, 0.42, 0.95, 0.78, 0.35, 0.28, 0.55],
    [0.22, 0.35, 0.58, 0.42, 0.75, 0.28, 0.92, 0.48, 0.82, 0.31],
    [0.91, 0.85, 0.72, 0.68, 0.88, 0.82, 0.79, 0.75, 0.71, 0.95],
  ],
  weightsSparse: [
    [0.96, 0.91, 0.00, 0.00, 0.00, 0.49, 0.58, 0.00, 0.00, 0.82],
    [0.00, 0.42, 0.95, 0.90, 0.00, 0.00, 0.52, 0.84, 0.59, 0.00],
    [0.65, 0.69, 0.00, 0.00, 0.00, 0.97, 0.81, 0.00, 0.00, 0.52],
    [0.00, 0.00, 0.55, 0.00, 0.78, 0.00, 0.94, 0.45, 0.85, 0.00],
    [0.93, 0.88, 0.69, 0.65, 0.91, 0.85, 0.82, 0.72, 0.68, 0.97],
  ],
};

// Cross-validation data (reconstruction loss - lower is better)
const cvData = {
  poisson: [
    { m: 1, loss: 2850 },
    { m: 2, loss: 2420 },
    { m: 3, loss: 2180 },
    { m: 4, loss: 2095 },
    { m: 5, loss: 2070 },
  ],
  bernoulli: [
    { m: 1, loss: 1920 },
    { m: 2, loss: 1580 },
    { m: 3, loss: 1380 },
    { m: 4, loss: 1290 },
    { m: 5, loss: 1265 },
  ],
};

function valueToColor(v: number): string {
  if (v === 0) return "white";
  const t = (v + 1) / 2;
  
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
  const [view, setView] = useState<"weights" | "cv">("weights");
  const [useLaplace, setUseLaplace] = useState(false);
  
  const rawData = mode === "poisson" ? poissonData : bernoulliData;
  const weights = useLaplace ? rawData.weightsSparse : rawData.weights;
  const data = { ...rawData, weights };
  
  const cellSize = 44;
  const labelWidth = 100;
  const labelHeight = 90;
  const heatmapWidth = labelWidth + data.observations.length * cellSize;
  const heatmapHeight = labelHeight + data.factors.length * cellSize;

  // CV chart dimensions - same width as heatmap
  const cvWidth = heatmapWidth;
  const cvHeight = heatmapHeight;
  const cvPadding = { top: 40, right: 40, bottom: 60, left: 80 };
  const cvPlotWidth = cvWidth - cvPadding.left - cvPadding.right;
  const cvPlotHeight = cvHeight - cvPadding.top - cvPadding.bottom;
  
  const cv = cvData[mode];
  const minLoss = Math.min(...cv.map(d => d.loss));
  const maxLoss = Math.max(...cv.map(d => d.loss));
  const lossRange = maxLoss - minLoss;

  return (
    <div className="viz-container">
      <div className="controls-row">
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
        
        <div className="toggle-row">
          <button 
            className={`toggle-btn ${view === "weights" ? "active" : ""}`}
            onClick={() => setView("weights")}
          >
            Weights
          </button>
          <button 
            className={`toggle-btn ${view === "cv" ? "active" : ""}`}
            onClick={() => setView("cv")}
          >
            Cross-validation
          </button>
        </div>
      </div>

      {view === "weights" ? (
        <>
          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useLaplace}
                onChange={(e) => setUseLaplace(e.target.checked)}
              />
              <span>Laplace (L1) prior</span>
            </label>
          </div>

          <svg viewBox={`0 0 ${heatmapWidth} ${heatmapHeight}`} className="heatmap-svg">
            {/* Column labels (observations) - rotated 90 degrees */}
            {data.observations.map((obs, i) => (
              <text
                key={obs}
                x={0}
                y={0}
                textAnchor="start"
                fontSize="11"
                fill="var(--fg)"
                fontFamily="var(--font-geist-sans), system-ui"
                transform={`translate(${labelWidth + i * cellSize + cellSize / 2 + 4}, ${labelHeight - 10}) rotate(-90)`}
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
                    stroke={value === 0 ? "var(--border)" : "none"}
                    strokeWidth="1"
                  />
                  {value !== 0 && (
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
                  )}
                </g>
              ))
            )}
          </svg>
        </>
      ) : (
        <svg viewBox={`0 0 ${cvWidth} ${cvHeight}`} className="cv-svg">
          {/* Y axis */}
          <line
            x1={cvPadding.left}
            y1={cvPadding.top}
            x2={cvPadding.left}
            y2={cvHeight - cvPadding.bottom}
            stroke="var(--border)"
            strokeWidth="1"
          />
          {/* X axis */}
          <line
            x1={cvPadding.left}
            y1={cvHeight - cvPadding.bottom}
            x2={cvWidth - cvPadding.right}
            y2={cvHeight - cvPadding.bottom}
            stroke="var(--border)"
            strokeWidth="1"
          />
          
          {/* Y axis label */}
          <text
            x={20}
            y={cvPadding.top + cvPlotHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
            transform={`rotate(-90, 20, ${cvPadding.top + cvPlotHeight / 2})`}
          >
            Reconstruction loss
          </text>
          
          {/* X axis label */}
          <text
            x={cvPadding.left + cvPlotWidth / 2}
            y={cvHeight - 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
          >
            Number of state factors (M)
          </text>
          
          {/* Grid lines and Y tick labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = cvPadding.top + (1 - t) * cvPlotHeight;
            const value = minLoss + t * lossRange;
            return (
              <g key={i}>
                <line
                  x1={cvPadding.left}
                  y1={y}
                  x2={cvWidth - cvPadding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                <text
                  x={cvPadding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--muted)"
                  fontFamily="var(--font-geist-mono), monospace"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}
          
          {/* Data points and line */}
          <polyline
            points={cv.map((d, i) => {
              const x = cvPadding.left + ((d.m - 1) / 4) * cvPlotWidth;
              const y = cvPadding.top + (1 - (d.loss - minLoss) / lossRange) * cvPlotHeight;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="var(--fg)"
            strokeWidth="2"
          />
          {cv.map((d, i) => {
            const x = cvPadding.left + ((d.m - 1) / 4) * cvPlotWidth;
            const y = cvPadding.top + (1 - (d.loss - minLoss) / lossRange) * cvPlotHeight;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6" fill="var(--bg)" stroke="var(--fg)" strokeWidth="2" />
                <text
                  x={x}
                  y={cvHeight - cvPadding.bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--fg)"
                  fontFamily="var(--font-geist-mono), monospace"
                >
                  {d.m}
                </text>
              </g>
            );
          })}
          
          {/* Elbow annotation */}
          <text
            x={cvPadding.left + (2 / 4) * cvPlotWidth + 15}
            y={cvPadding.top + (1 - (cv[2].loss - minLoss) / lossRange) * cvPlotHeight - 12}
            fontSize="10"
            fill="var(--muted)"
            fontFamily="var(--font-geist-sans), system-ui"
          >
            ← elbow
          </text>
        </svg>
      )}

      <style jsx>{`
        .viz-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          margin: var(--space-6) 0;
        }
        .controls-row {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: center;
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
        .checkbox-row {
          display: flex;
          justify-content: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--fg);
          cursor: pointer;
        }
        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .heatmap-svg {
          max-width: 600px;
          width: 100%;
          height: auto;
        }
        .cv-svg {
          max-width: 600px;
          width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
