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
    // For correlation r: x1 = z1, x2 = r*z1 + sqrt(1-r^2)*z2
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

// Generate ellipse points for the correlation contour
function generateEllipse(correlation: number, scale: number = 2, points: number = 100): string {
  const coords = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * 2 * Math.PI;
    // Eigenvalue decomposition for bivariate normal
    const lambda1 = 1 + correlation;
    const lambda2 = 1 - correlation;
    const x = scale * Math.sqrt(lambda1) * Math.cos(t) * Math.cos(Math.PI / 4) 
            - scale * Math.sqrt(lambda2) * Math.sin(t) * Math.sin(Math.PI / 4);
    const y = scale * Math.sqrt(lambda1) * Math.cos(t) * Math.sin(Math.PI / 4) 
            + scale * Math.sqrt(lambda2) * Math.sin(t) * Math.cos(Math.PI / 4);
    coords.push(`${x},${y}`);
  }
  return coords.join(" ");
}

export function FrailtyVisual() {
  const [correlation, setCorrelation] = useState(-0.6);
  const [hoveredCustomer, setHoveredCustomer] = useState<number | null>(null);
  
  const customers = useMemo(() => generateCustomers(80, correlation), [correlation]);
  
  const width = 500;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  
  // Scale: frailties typically range from -3 to 3 (standard normal)
  const range = 3.2;
  const scaleX = (v: number) => padding.left + ((v + range) / (2 * range)) * plotWidth;
  const scaleY = (v: number) => padding.top + ((range - v) / (2 * range)) * plotHeight;
  
  // Value to color: green (high value) to red (low value)
  const valueToColor = (value: number) => {
    const normalized = Math.max(0, Math.min(1, (value + 4) / 8)); // value ranges roughly -4 to 4
    if (normalized > 0.5) {
      // White to green
      const t = (normalized - 0.5) * 2;
      const r = Math.round(255 - t * 175);
      const g = Math.round(255 - t * 55);
      const b = Math.round(255 - t * 175);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Red to white
      const t = normalized * 2;
      const r = 255;
      const g = Math.round(100 + t * 155);
      const b = Math.round(100 + t * 155);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };
  
  const ellipsePath = useMemo(() => {
    const points = [];
    const numPoints = 100;
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      const scale = 1.8;
      // For correlation r, the ellipse axes are rotated 45 degrees
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

  return (
    <div className="frailty-container">
      <div className="correlation-control">
        <label>
          <span className="control-label">Correlation (ρ): {correlation.toFixed(2)}</span>
          <input
            type="range"
            min="-0.9"
            max="0.9"
            step="0.1"
            value={correlation}
            onChange={(e) => setCorrelation(parseFloat(e.target.value))}
          />
        </label>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="frailty-svg">
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
              strokeDasharray={v === 0 ? "none" : "3,3"}
              opacity={v === 0 ? 0.5 : 0.3}
            />
            <line
              x1={padding.left}
              y1={scaleY(v)}
              x2={width - padding.right}
              y2={scaleY(v)}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={v === 0 ? "none" : "3,3"}
              opacity={v === 0 ? 0.5 : 0.3}
            />
          </g>
        ))}
        
        {/* Correlation ellipse (1.5 std dev) */}
        <path
          d={ellipsePath}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.6"
        />
        
        {/* Customer points */}
        {customers.map((c) => (
          <circle
            key={c.id}
            cx={scaleX(c.expandFrailty)}
            cy={scaleY(c.churnFrailty)}
            r={hoveredCustomer === c.id ? 8 : 5}
            fill={valueToColor(c.value)}
            stroke={hoveredCustomer === c.id ? "var(--fg)" : "var(--border)"}
            strokeWidth={hoveredCustomer === c.id ? 2 : 1}
            opacity={0.85}
            style={{ cursor: "pointer", transition: "r 0.15s" }}
            onMouseEnter={() => setHoveredCustomer(c.id)}
            onMouseLeave={() => setHoveredCustomer(null)}
          />
        ))}
        
        {/* Axes labels */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 15}
          textAnchor="middle"
          fontSize="12"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          fontWeight="500"
        >
          Expansion frailty (z_expand)
        </text>
        <text
          x={20}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          fontWeight="500"
          transform={`rotate(-90, 20, ${padding.top + plotHeight / 2})`}
        >
          Churn frailty (z_churn)
        </text>
        
        {/* Quadrant labels */}
        <text
          x={scaleX(2)}
          y={scaleY(2) + 15}
          textAnchor="end"
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          high expand, high churn
        </text>
        <text
          x={scaleX(-2)}
          y={scaleY(2) + 15}
          textAnchor="start"
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          low expand, high churn
        </text>
        <text
          x={scaleX(2)}
          y={scaleY(-2) - 5}
          textAnchor="end"
          fontSize="10"
          fill="#4ade80"
          fontFamily="var(--font-geist-sans), system-ui"
          fontWeight="600"
        >
          ★ high value
        </text>
        <text
          x={scaleX(-2)}
          y={scaleY(-2) - 5}
          textAnchor="start"
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          low expand, low churn
        </text>
        
        {/* Value colorbar */}
        <defs>
          <linearGradient id="frailtyValueGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={valueToColor(-4)} />
            <stop offset="50%" stopColor={valueToColor(0)} />
            <stop offset="100%" stopColor={valueToColor(4)} />
          </linearGradient>
        </defs>
        <rect
          x={width - padding.right + 15}
          y={padding.top}
          width={12}
          height={plotHeight}
          fill="url(#frailtyValueGradient)"
          rx="2"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x={width - padding.right + 21}
          y={padding.top - 8}
          textAnchor="middle"
          fontSize="10"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          fontWeight="500"
        >
          Value
        </text>
      </svg>
      
      <div className="frailty-caption">
        <span>Each dot is a customer. Color shows implied CLV contribution.</span>
        <span className="caption-detail">
          {correlation < 0 
            ? "Negative correlation: customers who expand rarely churn."
            : correlation > 0
            ? "Positive correlation: risky customers are risky everywhere."
            : "No correlation: expansion and churn are independent."}
        </span>
      </div>

      <style jsx>{`
        .frailty-container {
          margin: var(--space-6) 0;
        }
        
        .correlation-control {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-4);
        }
        
        .correlation-control label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }
        
        .control-label {
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--fg);
        }
        
        .correlation-control input[type="range"] {
          width: 200px;
          accent-color: var(--accent);
        }
        
        .frailty-svg {
          width: 100%;
          max-width: 500px;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        .frailty-caption {
          text-align: center;
          margin-top: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .frailty-caption span {
          font-size: 12px;
          color: var(--muted);
        }
        
        .caption-detail {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

