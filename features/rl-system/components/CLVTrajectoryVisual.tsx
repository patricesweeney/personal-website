"use client";

import { useState, useEffect, useMemo } from "react";

export function CLVTrajectoryVisual() {
  const [arpa, setArpa] = useState(100);
  const [nrrCap, setNrrCap] = useState(1.15); // Max NRR (115%)
  const [churnPeriod, setChurnPeriod] = useState(8);
  const [discountRate, setDiscountRate] = useState(0.1);
  const [mounted, setMounted] = useState(false);

  const gamma = 1 - discountRate;
  const isDiscounted = discountRate > 0.001;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate revenue trajectory with sigmoid NRR growth then churn
  const trajectory = useMemo(() => {
    const periods = 12;
    const points: { t: number; revenue: number; discountedRevenue: number; nrr: number }[] = [];
    
    let currentRevenue = arpa;
    
    for (let t = 0; t < periods; t++) {
      if (t >= churnPeriod) {
        // Customer has churned
        points.push({ t, revenue: 0, discountedRevenue: 0, nrr: 0 });
      } else {
        // Sigmoid NRR: starts at ~1.0, grows toward nrrCap
        const midpoint = churnPeriod / 2;
        const steepness = 0.8;
        const sigmoid = 1 / (1 + Math.exp(-steepness * (t - midpoint)));
        const nrr = t === 0 ? 1 : 1 + (nrrCap - 1) * sigmoid;
        
        if (t > 0) {
          currentRevenue = currentRevenue * nrr;
        }
        
        const discountFactor = Math.pow(gamma, t);
        points.push({ 
          t, 
          revenue: currentRevenue, 
          discountedRevenue: currentRevenue * discountFactor,
          nrr: t === 0 ? 1 : nrr 
        });
      }
    }
    
    return points;
  }, [arpa, nrrCap, churnPeriod, gamma]);

  const maxRevenue = Math.max(...trajectory.map((p) => p.revenue));
  const chartHeight = 140;
  const topPadding = 12;
  const plotHeight = chartHeight - topPadding;

  // Generate SVG path for the undiscounted line
  const linePath = useMemo(() => {
    const points = trajectory.map((p, i) => {
      const x = (i / (trajectory.length - 1)) * 100;
      const y = topPadding + plotHeight - (p.revenue / maxRevenue) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return points.join(" ");
  }, [trajectory, maxRevenue, plotHeight, topPadding]);

  // Generate SVG path for undiscounted area fill
  const areaPath = useMemo(() => {
    const points = trajectory.map((p, i) => {
      const x = (i / (trajectory.length - 1)) * 100;
      const y = topPadding + plotHeight - (p.revenue / maxRevenue) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return `${points.join(" ")} L 100 ${chartHeight} L 0 ${chartHeight} Z`;
  }, [trajectory, maxRevenue, plotHeight, topPadding, chartHeight]);

  // Generate SVG path for discounted area fill
  const discountedAreaPath = useMemo(() => {
    const points = trajectory.map((p, i) => {
      const x = (i / (trajectory.length - 1)) * 100;
      const y = topPadding + plotHeight - (p.discountedRevenue / maxRevenue) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return `${points.join(" ")} L 100 ${chartHeight} L 0 ${chartHeight} Z`;
  }, [trajectory, maxRevenue, plotHeight, topPadding, chartHeight]);

  // Generate SVG path for discounted line
  const discountedLinePath = useMemo(() => {
    const points = trajectory.map((p, i) => {
      const x = (i / (trajectory.length - 1)) * 100;
      const y = topPadding + plotHeight - (p.discountedRevenue / maxRevenue) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return points.join(" ");
  }, [trajectory, maxRevenue, plotHeight, topPadding]);

  const totalRevenue = trajectory.reduce((sum, p) => sum + p.revenue, 0);
  const totalDiscountedRevenue = trajectory.reduce((sum, p) => sum + p.discountedRevenue, 0);
  const displayCLV = isDiscounted ? totalDiscountedRevenue : totalRevenue;

  // Y-axis labels (NRR percentages)
  const yLabels = [
    { value: nrrCap, label: `${(nrrCap * 100).toFixed(0)}%` },
    { value: 1.0, label: "100%" },
  ];

  return (
    <div className="clv-visual">
      <div className="controls">
        <div className="control">
          <span className="control-label">ARPA: ${arpa}</span>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={arpa}
            onChange={(e) => setArpa(Number(e.target.value))}
          />
        </div>
        <div className="control">
          <span className="control-label">
            NRR cap: {(nrrCap * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="1.0"
            max="1.3"
            step="0.01"
            value={nrrCap}
            onChange={(e) => setNrrCap(Number(e.target.value))}
          />
        </div>
        <div className="control">
          <span className="control-label">Churn at: t={churnPeriod}</span>
          <input
            type="range"
            min="3"
            max="11"
            step="1"
            value={churnPeriod}
            onChange={(e) => setChurnPeriod(Number(e.target.value))}
          />
        </div>
        <div className="control">
          <span className="control-label">
            Discount: {(discountRate * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0"
            max="0.15"
            step="0.01"
            value={discountRate}
            onChange={(e) => setDiscountRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="chart-area">
        <div className="y-axis">
          {yLabels.map((label) => (
            <span
              key={label.value}
              className="y-label"
              style={{
                bottom: `${((label.value - 1) / (nrrCap - 1 + 0.001)) * 60 + 20}%`,
              }}
            >
              {label.label}
            </span>
          ))}
          <span className="y-axis-title">NRR</span>
        </div>

        <div className="chart">
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
            className={`chart-svg ${mounted ? "visible" : ""}`}
          >
            {/* Ghost area (undiscounted) when discounting is on */}
            {isDiscounted && (
              <path d={areaPath} className="area-ghost" />
            )}
            {/* Main area fill (discounted or full) */}
            <path 
              d={isDiscounted ? discountedAreaPath : areaPath} 
              className="area-fill" 
            />
            {/* Ghost line (undiscounted) when discounting is on */}
            {isDiscounted && (
              <path d={linePath} className="line-ghost" />
            )}
            {/* Main line */}
            <path 
              d={isDiscounted ? discountedLinePath : linePath} 
              className="line" 
            />
            {/* Churn marker */}
            <line
              x1={(churnPeriod / (trajectory.length - 1)) * 100}
              y1="0"
              x2={(churnPeriod / (trajectory.length - 1)) * 100}
              y2={chartHeight}
              className="churn-line"
            />
          </svg>

          {/* X-axis labels */}
          <div className="x-labels">
            {trajectory.map((p, i) =>
              i % 2 === 0 ? (
                <span key={p.t} className="x-label">
                  {p.t}
                </span>
              ) : (
                <span key={p.t} className="x-label" />
              )
            )}
          </div>

          <div className="time-axis">
            <div className="axis-line" />
            <span className="axis-label">Time</span>
          </div>
        </div>

        <div className="summary">
          <div className="summary-label">
            {isDiscounted ? "CLV (discounted)" : "CLV"}
          </div>
          <div className="summary-value">${Math.round(displayCLV)}</div>
          <div className="summary-note">
            {isDiscounted
              ? `${Math.round(((totalRevenue - totalDiscountedRevenue) / totalRevenue) * 100)}% less than FV`
              : "No discounting"}
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color revenue" />
          <span>{isDiscounted ? "Present value" : "Revenue"}</span>
        </div>
        {isDiscounted && (
          <div className="legend-item">
            <span className="legend-color ghost" />
            <span>Future value</span>
          </div>
        )}
        <div className="legend-item">
          <span className="legend-color churn" />
          <span>Churn</span>
        </div>
      </div>

      <style jsx>{`
        .clv-visual {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
        }

        .controls {
          display: flex;
          gap: var(--space-5);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }

        .control {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .control-label {
          font-size: 12px;
          color: var(--muted);
          min-width: 100px;
        }

        .control input[type="range"] {
          width: 80px;
          accent-color: var(--fg);
        }

        .chart-area {
          display: flex;
          gap: var(--space-3);
          align-items: flex-end;
        }

        .y-axis {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          width: 36px;
          height: ${chartHeight}px;
          flex-shrink: 0;
        }

        .y-label {
          position: absolute;
          right: 4px;
          font-family: var(--font-geist-mono), monospace;
          font-size: 9px;
          color: var(--muted);
          transform: translateY(50%);
        }

        .y-axis-title {
          position: absolute;
          top: 50%;
          left: 0;
          font-size: 10px;
          color: var(--muted);
          transform: rotate(-90deg) translateX(-50%);
          transform-origin: left center;
          white-space: nowrap;
        }

        .chart {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chart-svg {
          width: 100%;
          height: ${chartHeight}px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .chart-svg.visible {
          opacity: 1;
        }

        .area-fill {
          fill: color-mix(in srgb, var(--fg) 15%, transparent);
        }

        .area-ghost {
          fill: color-mix(in srgb, var(--fg) 6%, transparent);
        }

        .line {
          fill: none;
          stroke: var(--fg);
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }

        .line-ghost {
          fill: none;
          stroke: var(--muted);
          stroke-width: 1;
          stroke-dasharray: 4 2;
          vector-effect: non-scaling-stroke;
        }

        .churn-line {
          stroke: var(--muted);
          stroke-width: 1;
          stroke-dasharray: 4 2;
          vector-effect: non-scaling-stroke;
        }

        .x-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 0;
          margin-top: var(--space-2);
        }

        .x-label {
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          color: var(--muted);
          width: calc(100% / 12);
          text-align: center;
        }

        .time-axis {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: var(--space-1);
          padding-top: var(--space-3);
        }

        .axis-line {
          width: 100%;
          height: 1px;
          background: var(--border);
          position: relative;
        }

        .axis-line::after {
          content: "";
          position: absolute;
          right: -4px;
          top: -3px;
          border: 4px solid transparent;
          border-left-color: var(--border);
        }

        .axis-label {
          font-size: 11px;
          color: var(--muted);
          margin-top: var(--space-2);
        }

        .summary {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 150px;
          flex-shrink: 0;
          padding: var(--space-4);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
        }

        .summary-label {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 24px;
          font-weight: 600;
          margin-top: var(--space-1);
        }

        .summary-note {
          font-size: 11px;
          color: var(--muted);
          margin-top: var(--space-2);
        }

        .legend {
          display: flex;
          gap: var(--space-5);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 11px;
          color: var(--muted);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-color.revenue {
          background: var(--fg);
        }

        .legend-color.ghost {
          background: color-mix(in srgb, var(--fg) 15%, transparent);
          border: 1px dashed var(--muted);
        }

        .legend-color.churn {
          background: transparent;
          border: 1px dashed var(--muted);
        }

        @media (max-width: 700px) {
          .controls {
            flex-direction: column;
            gap: var(--space-3);
          }

          .chart-area {
            flex-direction: column;
            align-items: stretch;
          }

          .y-axis {
            display: none;
          }

          .summary {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .summary-value {
            margin-top: 0;
          }

          .summary-note {
            margin-top: 0;
            margin-left: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
}
