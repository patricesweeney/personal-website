"use client";

import { useState, useMemo } from "react";

// Shape functions for each factor (learned from data, here simulated)
const factors = [
  {
    name: "Usage depth",
    // Saturating curve - more usage is better but diminishing returns
    fn: (x: number) => 0.3 * (1 - Math.exp(-3 * x)),
    color: "#3b82f6",
    description: "Product engagement intensity",
  },
  {
    name: "Tenure",
    // U-shaped - new customers risky, mid-tenure stable, long-tenure very stable
    fn: (x: number) => -0.15 + 0.4 * x - 0.1 * Math.pow(x - 0.5, 2),
    color: "#8b5cf6",
    description: "Months since signup",
  },
  {
    name: "Support health",
    // Linear with threshold - bad support health hurts a lot
    fn: (x: number) => x < 0.3 ? -0.25 + 0.5 * x : 0.1 * x,
    color: "#10b981",
    description: "Ticket resolution & sentiment",
  },
  {
    name: "Expansion signals",
    // S-curve - strong signal at high values
    fn: (x: number) => 0.2 / (1 + Math.exp(-10 * (x - 0.6))),
    color: "#f59e0b",
    description: "Feature adoption & seat growth",
  },
];

// Baseline NRR (intercept)
const baseline = 0.95;

export function ValueDecompositionVisual() {
  const [values, setValues] = useState<number[]>([0.7, 0.5, 0.8, 0.4]);
  const [hoveredFactor, setHoveredFactor] = useState<number | null>(null);
  const [view, setView] = useState<"decomposition" | "shapes">("decomposition");

  const contributions = useMemo(() => {
    return factors.map((f, i) => ({
      ...f,
      value: values[i],
      contribution: f.fn(values[i]),
    }));
  }, [values]);

  const totalNRR = useMemo(() => {
    return baseline + contributions.reduce((sum, c) => sum + c.contribution, 0);
  }, [contributions]);

  const handleSliderChange = (index: number, newValue: number) => {
    const newValues = [...values];
    newValues[index] = newValue;
    setValues(newValues);
  };

  // Waterfall chart dimensions
  const waterfallWidth = 400;
  const waterfallHeight = 280;
  const barWidth = 50;
  const padding = { top: 40, right: 20, bottom: 60, left: 60 };
  const chartWidth = waterfallWidth - padding.left - padding.right;
  const chartHeight = waterfallHeight - padding.top - padding.bottom;

  // Scale for NRR values (typically 0.7 to 1.3)
  const minNRR = 0.7;
  const maxNRR = 1.3;
  const scaleY = (v: number) => padding.top + ((maxNRR - v) / (maxNRR - minNRR)) * chartHeight;

  // Shape function chart dimensions
  const shapeWidth = 180;
  const shapeHeight = 120;
  const shapePadding = 20;

  return (
    <div className="decomposition-container">
      <div className="toggle-row">
        <button 
          className={`toggle-btn ${view === "decomposition" ? "active" : ""}`}
          onClick={() => setView("decomposition")}
        >
          Value decomposition
        </button>
        <button 
          className={`toggle-btn ${view === "shapes" ? "active" : ""}`}
          onClick={() => setView("shapes")}
        >
          Shape functions
        </button>
      </div>

      <div className="main-content">
        {/* Left side: Sliders */}
        <div className="sliders-panel">
          <div className="panel-header">Customer state</div>
          {factors.map((factor, i) => (
            <div 
              key={i} 
              className={`slider-group ${hoveredFactor === i ? "highlighted" : ""}`}
              onMouseEnter={() => setHoveredFactor(i)}
              onMouseLeave={() => setHoveredFactor(null)}
            >
              <div className="slider-header">
                <span className="factor-name" style={{ color: factor.color }}>{factor.name}</span>
                <span className="factor-value">{values[i].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={values[i]}
                onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                style={{ accentColor: factor.color }}
              />
              <div className="contribution-badge" style={{ 
                backgroundColor: contributions[i].contribution >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: contributions[i].contribution >= 0 ? "#10b981" : "#ef4444"
              }}>
                {contributions[i].contribution >= 0 ? "+" : ""}{(contributions[i].contribution * 100).toFixed(1)}pp
              </div>
            </div>
          ))}
        </div>

        {/* Right side: Chart */}
        <div className="chart-panel">
          {view === "decomposition" ? (
            <>
              <svg viewBox={`0 0 ${waterfallWidth} ${waterfallHeight}`} className="waterfall-svg">
                {/* Grid lines */}
                {[0.8, 0.9, 1.0, 1.1, 1.2].map((v) => (
                  <g key={v}>
                    <line
                      x1={padding.left}
                      y1={scaleY(v)}
                      x2={waterfallWidth - padding.right}
                      y2={scaleY(v)}
                      stroke="var(--border)"
                      strokeWidth="1"
                      strokeDasharray={v === 1.0 ? "none" : "3,3"}
                      opacity={v === 1.0 ? 0.5 : 0.3}
                    />
                    <text
                      x={padding.left - 8}
                      y={scaleY(v) + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="var(--muted)"
                      fontFamily="var(--font-geist-mono), monospace"
                    >
                      {(v * 100).toFixed(0)}%
                    </text>
                  </g>
                ))}

                {/* Baseline bar */}
                <rect
                  x={padding.left + 10}
                  y={scaleY(baseline)}
                  width={barWidth}
                  height={scaleY(minNRR) - scaleY(baseline)}
                  fill="var(--muted)"
                  opacity="0.3"
                  rx="3"
                />
                <text
                  x={padding.left + 10 + barWidth / 2}
                  y={waterfallHeight - padding.bottom + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--muted)"
                >
                  Baseline
                </text>

                {/* Contribution bars (waterfall) */}
                {(() => {
                  let runningTotal = baseline;
                  return contributions.map((c, i) => {
                    const startY = scaleY(runningTotal);
                    const contribution = c.contribution;
                    runningTotal += contribution;
                    const endY = scaleY(runningTotal);
                    const barX = padding.left + 10 + (i + 1) * (barWidth + 15);
                    const isPositive = contribution >= 0;
                    const barTop = isPositive ? endY : startY;
                    const barHeight = Math.abs(endY - startY);
                    
                    return (
                      <g 
                        key={i}
                        className="contribution-bar"
                        onMouseEnter={() => setHoveredFactor(i)}
                        onMouseLeave={() => setHoveredFactor(null)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Connector line */}
                        <line
                          x1={barX - 15}
                          y1={startY}
                          x2={barX}
                          y2={startY}
                          stroke="var(--border)"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        {/* Bar */}
                        <rect
                          x={barX}
                          y={barTop}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          fill={c.color}
                          opacity={hoveredFactor === i ? 1 : 0.7}
                          rx="3"
                          className="bar-rect"
                        />
                        {/* Value label */}
                        <text
                          x={barX + barWidth / 2}
                          y={barTop - 6}
                          textAnchor="middle"
                          fontSize="9"
                          fill={c.color}
                          fontFamily="var(--font-geist-mono), monospace"
                          fontWeight="600"
                        >
                          {isPositive ? "+" : ""}{(contribution * 100).toFixed(1)}
                        </text>
                        {/* Label */}
                        <text
                          x={barX + barWidth / 2}
                          y={waterfallHeight - padding.bottom + 15}
                          textAnchor="middle"
                          fontSize="8"
                          fill="var(--fg)"
                          fontWeight={hoveredFactor === i ? "600" : "400"}
                        >
                          {c.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* Total bar */}
                <rect
                  x={padding.left + 10 + 5 * (barWidth + 15)}
                  y={scaleY(Math.max(totalNRR, minNRR))}
                  width={barWidth}
                  height={scaleY(minNRR) - scaleY(Math.max(totalNRR, minNRR))}
                  fill={totalNRR >= 1 ? "#10b981" : "#ef4444"}
                  rx="3"
                />
                <text
                  x={padding.left + 10 + 5 * (barWidth + 15) + barWidth / 2}
                  y={scaleY(Math.max(totalNRR, minNRR)) - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill={totalNRR >= 1 ? "#10b981" : "#ef4444"}
                  fontFamily="var(--font-geist-mono), monospace"
                  fontWeight="700"
                >
                  {(totalNRR * 100).toFixed(1)}%
                </text>
                <text
                  x={padding.left + 10 + 5 * (barWidth + 15) + barWidth / 2}
                  y={waterfallHeight - padding.bottom + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--fg)"
                  fontWeight="600"
                >
                  NRR
                </text>
              </svg>
              
              <div className="nrr-summary">
                <span className="nrr-label">Predicted NRR:</span>
                <span className="nrr-value" style={{ color: totalNRR >= 1 ? "#10b981" : "#ef4444" }}>
                  {(totalNRR * 100).toFixed(1)}%
                </span>
                <span className="nrr-interpretation">
                  {totalNRR >= 1.1 ? "Strong growth" : totalNRR >= 1.0 ? "Healthy" : totalNRR >= 0.9 ? "At risk" : "Churning"}
                </span>
              </div>
            </>
          ) : (
            <div className="shapes-grid">
              {factors.map((factor, i) => {
                const points = [];
                for (let x = 0; x <= 1; x += 0.02) {
                  points.push({ x, y: factor.fn(x) });
                }
                const minY = Math.min(...points.map(p => p.y));
                const maxY = Math.max(...points.map(p => p.y));
                const rangeY = maxY - minY || 0.1;
                
                const scaleShapeX = (x: number) => shapePadding + x * (shapeWidth - 2 * shapePadding);
                const scaleShapeY = (y: number) => shapeHeight - shapePadding - ((y - minY) / rangeY) * (shapeHeight - 2 * shapePadding);
                
                const pathD = points.map((p, j) => 
                  `${j === 0 ? 'M' : 'L'} ${scaleShapeX(p.x)} ${scaleShapeY(p.y)}`
                ).join(' ');
                
                const currentY = factor.fn(values[i]);
                
                return (
                  <div 
                    key={i} 
                    className={`shape-card ${hoveredFactor === i ? "highlighted" : ""}`}
                    onMouseEnter={() => setHoveredFactor(i)}
                    onMouseLeave={() => setHoveredFactor(null)}
                  >
                    <div className="shape-header">
                      <span style={{ color: factor.color }}>{factor.name}</span>
                    </div>
                    <svg viewBox={`0 0 ${shapeWidth} ${shapeHeight}`} className="shape-svg">
                      {/* Zero line */}
                      <line
                        x1={shapePadding}
                        y1={scaleShapeY(0)}
                        x2={shapeWidth - shapePadding}
                        y2={scaleShapeY(0)}
                        stroke="var(--border)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      {/* Shape function curve */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={factor.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Current value marker */}
                      <circle
                        cx={scaleShapeX(values[i])}
                        cy={scaleShapeY(currentY)}
                        r="5"
                        fill={factor.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      {/* Current value vertical line */}
                      <line
                        x1={scaleShapeX(values[i])}
                        y1={scaleShapeY(0)}
                        x2={scaleShapeX(values[i])}
                        y2={scaleShapeY(currentY)}
                        stroke={factor.color}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                    </svg>
                    <div className="shape-footer">
                      <span className="shape-contribution" style={{ color: currentY >= 0 ? "#10b981" : "#ef4444" }}>
                        {currentY >= 0 ? "+" : ""}{(currentY * 100).toFixed(1)}pp
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .decomposition-container {
          margin: var(--space-6) 0;
        }
        
        .toggle-row {
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }
        
        .toggle-btn {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          background: var(--bg);
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--muted);
        }
        
        .toggle-btn:hover {
          border-color: var(--fg);
          color: var(--fg);
        }
        
        .toggle-btn.active {
          background: var(--fg);
          color: var(--bg);
          border-color: var(--fg);
        }
        
        .main-content {
          display: flex;
          gap: var(--space-4);
          align-items: stretch;
          min-height: 340px;
        }
        
        .sliders-panel {
          flex: 0 0 200px;
          background: var(--card-bg, #fafafa);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
        }
        
        .panel-header {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-3);
        }
        
        .slider-group {
          margin-bottom: var(--space-3);
          padding: var(--space-2);
          border-radius: 6px;
          transition: background 0.15s;
        }
        
        .slider-group.highlighted {
          background: rgba(0,0,0,0.03);
        }
        
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-1);
        }
        
        .factor-name {
          font-size: 12px;
          font-weight: 500;
        }
        
        .factor-value {
          font-size: 11px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--muted);
        }
        
        .slider-group input[type="range"] {
          width: 100%;
          height: 4px;
          cursor: pointer;
        }
        
        .contribution-badge {
          margin-top: var(--space-1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-family: var(--font-geist-mono), monospace;
          font-weight: 600;
          display: inline-block;
        }
        
        .chart-panel {
          flex: 1;
          min-width: 0;
          background: var(--card-bg, #fafafa);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .waterfall-svg {
          width: 100%;
          max-width: 400px;
          height: auto;
          display: block;
        }
        
        .bar-rect {
          transition: opacity 0.15s;
        }
        
        .nrr-summary {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          max-width: 400px;
        }
        
        .nrr-label {
          font-size: 12px;
          color: var(--muted);
        }
        
        .nrr-value {
          font-size: 18px;
          font-family: var(--font-geist-mono), monospace;
          font-weight: 700;
        }
        
        .nrr-interpretation {
          font-size: 11px;
          color: var(--muted);
          font-style: italic;
          margin-left: auto;
        }
        
        .shapes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }
        
        .shape-card {
          background: var(--card-bg, #fafafa);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-2);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        
        .shape-card.highlighted {
          border-color: var(--fg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .shape-header {
          font-size: 11px;
          font-weight: 600;
          margin-bottom: var(--space-1);
        }
        
        .shape-svg {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .shape-footer {
          text-align: center;
          margin-top: var(--space-1);
        }
        
        .shape-contribution {
          font-size: 12px;
          font-family: var(--font-geist-mono), monospace;
          font-weight: 600;
        }
        
        @media (max-width: 600px) {
          .main-content {
            flex-direction: column;
          }
          
          .sliders-panel {
            flex: none;
            width: 100%;
          }
          
          .shapes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

