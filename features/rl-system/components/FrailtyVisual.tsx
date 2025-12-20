"use client";

import { useState, useMemo } from "react";

// Generate correlated frailty values using Cholesky decomposition
function generateCustomers(n: number, correlation: number): Array<{
  id: number;
  expandFrailty: number;
  churnFrailty: number;
  value: number;
}> {
  const customers = [];
  
  // Use seeded random for consistency
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < n; i++) {
    // Generate two independent standard normals using Box-Muller
    const u1 = seededRandom(i * 2 + 1);
    const u2 = seededRandom(i * 2 + 2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    // Apply Cholesky to get correlated values
    const expandFrailty = z1;
    const churnFrailty = correlation * z1 + Math.sqrt(1 - correlation * correlation) * z2;
    
    // Value is higher when expand frailty is high and churn frailty is low
    const value = expandFrailty - churnFrailty;
    
    customers.push({
      id: i,
      expandFrailty,
      churnFrailty,
      value,
    });
  }
  
  return customers;
}

export function FrailtyVisual() {
  const [correlation, setCorrelation] = useState(-0.6);
  const [hoveredCustomer, setHoveredCustomer] = useState<number | null>(null);
  
  const customers = useMemo(() => generateCustomers(80, correlation), [correlation]);
  
  const width = 520;
  const height = 420;
  const padding = { top: 50, right: 60, bottom: 70, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  
  // Scale: frailties typically range from -3 to 3 (standard normal)
  const range = 3.2;
  const scaleX = (v: number) => padding.left + ((v + range) / (2 * range)) * plotWidth;
  const scaleY = (v: number) => padding.top + ((range - v) / (2 * range)) * plotHeight;
  
  // Value to color: green (high value) to red (low value)
  const valueToColor = (value: number, alpha: number = 1) => {
    const normalized = Math.max(0, Math.min(1, (value + 4) / 8));
    if (normalized > 0.5) {
      const t = (normalized - 0.5) * 2;
      const r = Math.round(255 - t * 175);
      const g = Math.round(255 - t * 55);
      const b = Math.round(255 - t * 175);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      const t = normalized * 2;
      const r = 255;
      const g = Math.round(100 + t * 155);
      const b = Math.round(100 + t * 155);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  };
  
  const ellipsePath = useMemo(() => {
    const points = [];
    const numPoints = 100;
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      const scale = 1.8;
      const lambda1 = Math.sqrt(1 + correlation);
      const lambda2 = Math.sqrt(1 - correlation);
      const cos45 = Math.cos(Math.PI / 4);
      const sin45 = Math.sin(Math.PI / 4);
      const x = scale * (lambda1 * Math.cos(t) * cos45 - lambda2 * Math.sin(t) * sin45);
      const y = scale * (lambda1 * Math.cos(t) * sin45 + lambda2 * Math.sin(t) * cos45);
      points.push(`${scaleX(x)},${scaleY(y)}`);
    }
    return `M ${points.join(" L ")} Z`;
  }, [correlation]);

  const hoveredData = hoveredCustomer !== null 
    ? customers.find(c => c.id === hoveredCustomer) 
    : null;

  const getCorrelationLabel = () => {
    if (correlation < -0.3) return "Negatively correlated";
    if (correlation > 0.3) return "Positively correlated";
    return "Weakly correlated";
  };

  return (
    <div className="frailty-container">
      <div className="controls-row">
        <div className="correlation-control">
          <span className="control-label">Correlation</span>
          <div className="slider-row">
            <span className="slider-end">−1</span>
            <input
              type="range"
              min="-0.9"
              max="0.9"
              step="0.05"
              value={correlation}
              onChange={(e) => setCorrelation(parseFloat(e.target.value))}
            />
            <span className="slider-end">+1</span>
          </div>
          <span className="correlation-value">{correlation.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="frailty-svg">
          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="var(--card-bg, #fafafa)"
            rx="4"
          />
          
          {/* Grid lines */}
          {[-2, -1, 0, 1, 2].map((v) => (
            <g key={v}>
              <line
                x1={scaleX(v)}
                y1={padding.top}
                x2={scaleX(v)}
                y2={height - padding.bottom}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={v === 0 ? "none" : "2,4"}
                opacity={v === 0 ? 0.4 : 0.25}
              />
              <line
                x1={padding.left}
                y1={scaleY(v)}
                x2={width - padding.right}
                y2={scaleY(v)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={v === 0 ? "none" : "2,4"}
                opacity={v === 0 ? 0.4 : 0.25}
              />
            </g>
          ))}
          
          {/* Correlation ellipse */}
          <path
            d={ellipsePath}
            fill="none"
            stroke="var(--fg)"
            strokeWidth="1.5"
            strokeDasharray="8,6"
            opacity="0.25"
            className="ellipse-path"
          />
          
          {/* Customer points */}
          {customers.map((c) => {
            const isHovered = hoveredCustomer === c.id;
            return (
              <g key={c.id} className="customer-point">
                {isHovered && (
                  <circle
                    cx={scaleX(c.expandFrailty)}
                    cy={scaleY(c.churnFrailty)}
                    r={16}
                    fill={valueToColor(c.value, 0.15)}
                    className="hover-ring"
                  />
                )}
                <circle
                  cx={scaleX(c.expandFrailty)}
                  cy={scaleY(c.churnFrailty)}
                  r={isHovered ? 7 : 5}
                  fill={valueToColor(c.value)}
                  stroke={isHovered ? "var(--fg)" : "rgba(255,255,255,0.8)"}
                  strokeWidth={isHovered ? 2 : 1}
                  className="point-circle"
                  onMouseEnter={() => setHoveredCustomer(c.id)}
                  onMouseLeave={() => setHoveredCustomer(null)}
                />
              </g>
            );
          })}
          
          {/* Axes labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fontSize="13"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
            fontWeight="500"
          >
            Expansion propensity
          </text>
          <text
            x={25}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            fontSize="13"
            fill="var(--fg)"
            fontFamily="var(--font-geist-sans), system-ui"
            fontWeight="500"
            transform={`rotate(-90, 25, ${padding.top + plotHeight / 2})`}
          >
            Churn propensity
          </text>
          
          {/* Axis endpoints */}
          <text x={padding.left} y={height - padding.bottom + 18} textAnchor="middle" fontSize="10" fill="var(--muted)">low</text>
          <text x={width - padding.right} y={height - padding.bottom + 18} textAnchor="middle" fontSize="10" fill="var(--muted)">high</text>
          <text x={padding.left - 12} y={height - padding.bottom} textAnchor="end" fontSize="10" fill="var(--muted)">low</text>
          <text x={padding.left - 12} y={padding.top + 4} textAnchor="end" fontSize="10" fill="var(--muted)">high</text>
          
          {/* Corner annotations */}
          <g className="corner-label" opacity="0.7">
            <text x={width - padding.right - 8} y={padding.top + 18} textAnchor="end" fontSize="10" fill="#4ade80" fontWeight="600">
              ★ Best customers
            </text>
            <text x={width - padding.right - 8} y={padding.top + 30} textAnchor="end" fontSize="9" fill="var(--muted)">
              expand often, rarely churn
            </text>
          </g>
          <g className="corner-label" opacity="0.7">
            <text x={padding.left + 8} y={height - padding.bottom - 18} textAnchor="start" fontSize="10" fill="#f87171" fontWeight="600">
              ✗ At risk
            </text>
            <text x={padding.left + 8} y={height - padding.bottom - 6} textAnchor="start" fontSize="9" fill="var(--muted)">
              don't expand, likely to churn
            </text>
          </g>
          
          {/* Value colorbar */}
          <defs>
            <linearGradient id="frailtyValueGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={valueToColor(-4)} />
              <stop offset="50%" stopColor={valueToColor(0)} />
              <stop offset="100%" stopColor={valueToColor(4)} />
            </linearGradient>
          </defs>
          <rect
            x={width - padding.right + 20}
            y={padding.top}
            width={14}
            height={plotHeight}
            fill="url(#frailtyValueGradient)"
            rx="3"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text x={width - padding.right + 27} y={padding.top - 10} textAnchor="middle" fontSize="11" fill="var(--fg)" fontWeight="500">
            Value
          </text>
          <text x={width - padding.right + 44} y={padding.top + 10} textAnchor="start" fontSize="9" fill="var(--muted)">high</text>
          <text x={width - padding.right + 44} y={height - padding.bottom - 2} textAnchor="start" fontSize="9" fill="var(--muted)">low</text>
        </svg>
        
        {/* Tooltip */}
        {hoveredData && (
          <div 
            className="tooltip"
            style={{
              left: scaleX(hoveredData.expandFrailty) + 15,
              top: scaleY(hoveredData.churnFrailty) - 10,
            }}
          >
            <div className="tooltip-row">
              <span className="tooltip-label">Expansion</span>
              <span className="tooltip-value" style={{ color: hoveredData.expandFrailty > 0 ? "#4ade80" : "#f87171" }}>
                {hoveredData.expandFrailty > 0 ? "+" : ""}{hoveredData.expandFrailty.toFixed(2)}
              </span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Churn</span>
              <span className="tooltip-value" style={{ color: hoveredData.churnFrailty > 0 ? "#f87171" : "#4ade80" }}>
                {hoveredData.churnFrailty > 0 ? "+" : ""}{hoveredData.churnFrailty.toFixed(2)}
              </span>
            </div>
            <div className="tooltip-divider" />
            <div className="tooltip-row">
              <span className="tooltip-label">Net value</span>
              <span className="tooltip-value" style={{ color: hoveredData.value > 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                {hoveredData.value > 0 ? "+" : ""}{hoveredData.value.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="frailty-caption">
        <span className="caption-main">
          Each dot is a customer. {getCorrelationLabel()} frailties shape the distribution.
        </span>
        <span className="caption-detail">
          {correlation < -0.3 
            ? "When expansion and churn are negatively correlated, the best customers cluster in the bottom-right."
            : correlation > 0.3
            ? "When frailties are positively correlated, volatile customers are volatile in both directions."
            : "With weak correlation, expansion and churn propensities are nearly independent."}
        </span>
      </div>

      <style jsx>{`
        .frailty-container {
          margin: var(--space-6) 0;
        }
        
        .controls-row {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-4);
        }
        
        .correlation-control {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--card-bg, #fafafa);
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        
        .control-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .slider-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .slider-end {
          font-size: 11px;
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
          width: 20px;
          text-align: center;
        }
        
        .correlation-control input[type="range"] {
          width: 180px;
          height: 6px;
          accent-color: var(--fg);
          cursor: pointer;
        }
        
        .correlation-value {
          font-size: 18px;
          font-family: var(--font-geist-mono), monospace;
          font-weight: 600;
          color: var(--fg);
        }
        
        .chart-wrapper {
          position: relative;
        }
        
        .frailty-svg {
          width: 100%;
          max-width: 520px;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        .customer-point {
          cursor: pointer;
        }
        
        .point-circle {
          transition: r 0.15s ease, stroke-width 0.15s ease;
        }
        
        .hover-ring {
          animation: pulse 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        
        .ellipse-path {
          transition: d 0.3s ease;
        }
        
        .tooltip {
          position: absolute;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-2) var(--space-3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          pointer-events: none;
          z-index: 10;
          min-width: 120px;
        }
        
        .tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-3);
          font-size: 12px;
        }
        
        .tooltip-label {
          color: var(--muted);
        }
        
        .tooltip-value {
          font-family: var(--font-geist-mono), monospace;
        }
        
        .tooltip-divider {
          height: 1px;
          background: var(--border);
          margin: var(--space-1) 0;
        }
        
        .frailty-caption {
          text-align: center;
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .caption-main {
          font-size: 13px;
          color: var(--fg);
        }
        
        .caption-detail {
          font-size: 12px;
          color: var(--muted);
          font-style: italic;
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
