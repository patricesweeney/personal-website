"use client";

import { useState } from "react";

// Generate survival and hazard data for different customer types
function generateData(baseHazard: number, billing: "monthly" | "annual") {
  const months = Array.from({ length: 25 }, (_, i) => i);
  const hazard: number[] = [];
  const survival: number[] = [];
  
  let S = 1;
  for (let t = 0; t < 25; t++) {
    let h: number;
    if (billing === "monthly") {
      // Monthly: slightly increasing hazard over time
      h = baseHazard * (1 + t * 0.02);
    } else {
      // Annual: low base hazard with spikes at renewal months (12, 24)
      const isRenewal = t === 12 || t === 24;
      h = isRenewal ? baseHazard * 8 : baseHazard * 0.15;
    }
    hazard.push(h);
    S = S * Math.exp(-h);
    survival.push(S);
  }
  
  return { months, hazard, survival };
}

const customerTypes = [
  { name: "Low risk", color: "#22c55e", baseHazard: 0.02 },
  { name: "Medium risk", color: "#f59e0b", baseHazard: 0.06 },
  { name: "High risk", color: "#ef4444", baseHazard: 0.12 },
];

export function SurvivalVisual() {
  const [view, setView] = useState<"survival" | "hazard">("survival");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  
  const data = customerTypes.map(ct => ({
    ...ct,
    ...generateData(ct.baseHazard, billing),
  }));

  const width = 500;
  const height = 280;
  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxMonth = 24;
  const maxSurvival = 1;
  const maxHazard = 0.2;

  const xScale = (m: number) => padding.left + (m / maxMonth) * plotWidth;
  const yScaleSurvival = (s: number) => padding.top + (1 - s / maxSurvival) * plotHeight;
  const yScaleHazard = (h: number) => padding.top + (1 - h / maxHazard) * plotHeight;

  // Adjust hazard scale for annual billing (has spikes)
  const actualMaxHazard = billing === "annual" ? 1.0 : 0.2;
  const yScaleHazardActual = (h: number) => padding.top + (1 - h / actualMaxHazard) * plotHeight;
  
  const yScale = view === "survival" ? yScaleSurvival : yScaleHazardActual;
  const yLabel = view === "survival" ? "Survival probability S(t)" : "Hazard rate h(t)";
  const yTicks = view === "survival" 
    ? [0, 0.25, 0.5, 0.75, 1] 
    : billing === "annual" 
      ? [0, 0.25, 0.5, 0.75, 1.0]
      : [0, 0.05, 0.1, 0.15, 0.2];

  return (
    <div className="survival-container">
      <div className="controls-row">
        <div className="toggle-row">
          <button 
            className={`toggle-btn ${view === "survival" ? "active" : ""}`}
            onClick={() => setView("survival")}
          >
            Survival S(t)
          </button>
          <button 
            className={`toggle-btn ${view === "hazard" ? "active" : ""}`}
            onClick={() => setView("hazard")}
          >
            Hazard h(t)
          </button>
        </div>
        <div className="toggle-row">
          <button 
            className={`toggle-btn ${billing === "monthly" ? "active" : ""}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button 
            className={`toggle-btn ${billing === "annual" ? "active" : ""}`}
            onClick={() => setBilling("annual")}
          >
            Annual
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="survival-svg">
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="var(--border)"
              strokeDasharray="4,4"
              opacity="0.5"
            />
            <text
              x={padding.left - 10}
              y={yScale(tick) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--muted)"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {view === "survival" ? tick.toFixed(2) : tick.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X axis ticks */}
        {[0, 6, 12, 18, 24].map((m, i) => (
          <text
            key={i}
            x={xScale(m)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted)"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {m}
          </text>
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--border)"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--border)"
        />

        {/* Axis labels */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize="11"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          Months since signup
        </text>
        <text
          x={15}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          fontSize="11"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          transform={`rotate(-90, 15, ${padding.top + plotHeight / 2})`}
        >
          {yLabel}
        </text>

        {/* Lines for each customer type */}
        {data.map((ct, idx) => {
          const values = view === "survival" ? ct.survival : ct.hazard;
          const pathD = values
            .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
            .join(" ");
          
          return (
            <path
              key={ct.name}
              d={pathD}
              fill="none"
              stroke={ct.color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Hover line */}
        {hoveredMonth !== null && (
          <line
            x1={xScale(hoveredMonth)}
            y1={padding.top}
            x2={xScale(hoveredMonth)}
            y2={height - padding.bottom}
            stroke="var(--fg)"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        )}

        {/* Hover area */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const month = Math.round((x / rect.width) * maxMonth);
            setHoveredMonth(Math.max(0, Math.min(24, month)));
          }}
          onMouseLeave={() => setHoveredMonth(null)}
        />
      </svg>

      {/* Legend */}
      <div className="legend">
        {data.map((ct) => (
          <div key={ct.name} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: ct.color }} />
            <span className="legend-label">{ct.name}</span>
            {hoveredMonth !== null && (
              <span className="legend-value">
                {view === "survival" 
                  ? `${(ct.survival[hoveredMonth] * 100).toFixed(0)}%`
                  : ct.hazard[hoveredMonth].toFixed(3)
                }
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="caption">
        {view === "survival" 
          ? "S(t) = probability of remaining active at month t. Lower curves = faster churn."
          : "h(t) = instantaneous churn risk at month t. Higher curves = more likely to churn now."
        }
      </p>

      <style jsx>{`
        .survival-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
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
        .survival-svg {
          max-width: 500px;
          width: 100%;
          height: auto;
        }
        .legend {
          display: flex;
          gap: var(--space-5);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .legend-label {
          color: var(--fg);
        }
        .legend-value {
          font-family: var(--font-geist-mono), monospace;
          color: var(--muted);
          min-width: 45px;
        }
        .caption {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          max-width: 450px;
        }
      `}</style>
    </div>
  );
}

