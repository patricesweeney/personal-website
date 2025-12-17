"use client";

import { useState, useMemo } from "react";

type View = "arpa" | "nrr";

export function RevenueDecomposition() {
  const [view, setView] = useState<View>("arpa");
  const [showRevenue, setShowRevenue] = useState(true);
  
  // ARPA view parameters
  const [medianWTP, setMedianWTP] = useState(100);
  const [sigma, setSigma] = useState(0.6);
  
  // NRR view parameters
  const [baseRetention, setBaseRetention] = useState(0.92);
  const [expansionRate, setExpansionRate] = useState(1.08);
  const [contractionRate, setContractionRate] = useState(0.97);

  const chartHeight = 180;
  const topPadding = 12;
  const plotHeight = chartHeight - topPadding;

  // Lognormal CDF
  const lognormalCDF = (x: number, mu: number, sigma: number) => {
    if (x <= 0) return 0;
    const z = (Math.log(x) - mu) / sigma;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  // Error function approximation
  const erf = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  // ARPA view data
  const arpaData = useMemo(() => {
    const mu = Math.log(medianWTP);
    const points: { price: number; volume: number; revenue: number }[] = [];
    const maxPrice = medianWTP * 3;
    
    for (let i = 0; i <= 50; i++) {
      const price = (i / 50) * maxPrice;
      const volume = 1 - lognormalCDF(price, mu, sigma);
      const revenue = price * volume;
      points.push({ price, volume, revenue });
    }
    
    return points;
  }, [medianWTP, sigma]);

  const maxVolume = 1;
  const maxRevenue = Math.max(...arpaData.map(p => p.revenue));
  const maxPrice = medianWTP * 3;

  // Generate SVG paths for ARPA view
  const volumePath = useMemo(() => {
    return arpaData.map((p, i) => {
      const x = (p.price / maxPrice) * 100;
      const y = topPadding + plotHeight - (p.volume / maxVolume) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [arpaData, maxPrice, plotHeight, topPadding]);

  const volumeAreaPath = useMemo(() => {
    const points = arpaData.map((p) => {
      const x = (p.price / maxPrice) * 100;
      const y = topPadding + plotHeight - (p.volume / maxVolume) * plotHeight;
      return { x, y };
    });
    return `M ${points[0].x} ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(" ")} L 100 ${chartHeight} L 0 ${chartHeight} Z`;
  }, [arpaData, maxPrice, plotHeight, topPadding, chartHeight]);

  const revenuePath = useMemo(() => {
    return arpaData.map((p, i) => {
      const x = (p.price / maxPrice) * 100;
      const y = topPadding + plotHeight - (p.revenue / maxRevenue) * plotHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [arpaData, maxPrice, maxRevenue, plotHeight, topPadding]);

  // Optimal price (where revenue is maximized)
  const optimalPoint = arpaData.reduce((max, p) => p.revenue > max.revenue ? p : max, arpaData[0]);

  // Beta PDF (for retention and contraction)
  const betaPDF = (x: number, alpha: number, beta: number) => {
    if (x <= 0 || x >= 1) return 0;
    const B = (Math.exp(logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta)));
    return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) / B;
  };

  // Log gamma function (Lanczos approximation)
  const logGamma = (z: number): number => {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (z + i);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  };

  // Gamma PDF (for expansion, shifted to start at 1)
  const gammaPDF = (x: number, k: number, theta: number, shift: number = 1) => {
    const xs = x - shift;
    if (xs <= 0) return 0;
    return Math.pow(xs, k - 1) * Math.exp(-xs / theta) / (Math.pow(theta, k) * Math.exp(logGamma(k)));
  };

  // Generate distribution paths
  const distHeight = 96;
  const distWidth = 100;

  // Retention: Reflected Gamma distribution on [0.75, 1.0] (mirrored from expansion)
  const retentionDistPath = useMemo(() => {
    const minX = 0.75, maxX = 1.0;
    const mean = baseRetention;
    const k = 4; // shape parameter (same as expansion)
    const theta = (1 - mean) / k; // scale parameter (reflected: distance from 1.0)
    
    const points: { x: number; y: number }[] = [];
    let maxY = 0;
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const x = minX + t * (maxX - minX);
      // Reflected gamma: evaluate at (1 - x) shifted
      const reflected = maxX - x;
      const y = gammaPDF(1 + reflected, k, Math.max(theta, 0.01), 1);
      maxY = Math.max(maxY, y);
      points.push({ x: t * distWidth, y });
    }
    
    const meanX = ((mean - minX) / (maxX - minX)) * distWidth;
    
    return {
      path: points.map((p, i) => 
        `${i === 0 ? "M" : "L"} ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" "),
      area: `M 0 ${distHeight} ` + points.map(p => 
        `L ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" ") + ` L ${distWidth} ${distHeight} Z`,
      meanX
    };
  }, [baseRetention]);

  // Expansion: Gamma distribution on [1.0, 1.3+]
  const expansionDistPath = useMemo(() => {
    const minX = 1.0, maxX = 1.4;
    const mean = expansionRate;
    const k = 4; // shape parameter
    const theta = (mean - 1) / k; // scale parameter
    
    const points: { x: number; y: number }[] = [];
    let maxY = 0;
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const x = minX + t * (maxX - minX);
      const y = gammaPDF(x, k, Math.max(theta, 0.01), 1);
      maxY = Math.max(maxY, y);
      points.push({ x: t * distWidth, y });
    }
    
    const meanX = ((mean - minX) / (maxX - minX)) * distWidth;
    
    return {
      path: points.map((p, i) => 
        `${i === 0 ? "M" : "L"} ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" "),
      area: `M 0 ${distHeight} ` + points.map(p => 
        `L ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" ") + ` L ${distWidth} ${distHeight} Z`,
      meanX
    };
  }, [expansionRate]);

  // Contraction: Reflected Gamma distribution on [0.80, 1.0] (mirrored from expansion)
  const contractionDistPath = useMemo(() => {
    const minX = 0.80, maxX = 1.0;
    const mean = contractionRate;
    const k = 4; // shape parameter (same as expansion)
    const theta = (1 - mean) / k; // scale parameter (reflected: distance from 1.0)
    
    const points: { x: number; y: number }[] = [];
    let maxY = 0;
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const x = minX + t * (maxX - minX);
      // Reflected gamma: evaluate at (1 - x) shifted
      const reflected = maxX - x;
      const y = gammaPDF(1 + reflected, k, Math.max(theta, 0.01), 1);
      maxY = Math.max(maxY, y);
      points.push({ x: t * distWidth, y });
    }
    
    const meanX = ((mean - minX) / (maxX - minX)) * distWidth;
    
    return {
      path: points.map((p, i) => 
        `${i === 0 ? "M" : "L"} ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" "),
      area: `M 0 ${distHeight} ` + points.map(p => 
        `L ${p.x} ${distHeight - (p.y / (maxY || 1)) * (distHeight - 4)}`
      ).join(" ") + ` L ${distWidth} ${distHeight} Z`,
      meanX
    };
  }, [contractionRate]);

  return (
    <div className="decomposition-visual">
      <div className="view-toggle">
        <button 
          className={view === "arpa" ? "active" : ""} 
          onClick={() => setView("arpa")}
        >
          Land ARPA
        </button>
        <button 
          className={view === "nrr" ? "active" : ""} 
          onClick={() => setView("nrr")}
        >
          NRR
        </button>
      </div>

      <div className="content-area">
        {view === "arpa" ? (
          <>
            <div className="controls">
            <div className="control">
              <span className="control-label">Median WTP: ${medianWTP}</span>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={medianWTP}
                onChange={(e) => setMedianWTP(Number(e.target.value))}
              />
            </div>
            <div className="control">
              <span className="control-label">Dispersion: {sigma.toFixed(1)}</span>
              <input
                type="range"
                min="0.3"
                max="1.2"
                step="0.1"
                value={sigma}
                onChange={(e) => setSigma(Number(e.target.value))}
              />
            </div>
            <label className="toggle-control">
              <input
                type="checkbox"
                checked={showRevenue}
                onChange={(e) => setShowRevenue(e.target.checked)}
              />
              <span>Show revenue</span>
            </label>
          </div>

          <div className="chart-area">
            <div className="y-axis-label">Volume %</div>
            <div className="chart">
              <svg
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
                className="chart-svg"
              >
                {/* Volume area fill */}
                <path d={volumeAreaPath} className="area-fill volume-area" />
                {/* Volume line */}
                <path d={volumePath} className="line volume-line" />
                {/* Revenue line */}
                {showRevenue && (
                  <path d={revenuePath} className="line revenue-line" />
                )}
                {/* Optimal price marker */}
                {showRevenue && (
                  <line
                    x1={(optimalPoint.price / maxPrice) * 100}
                    y1={topPadding}
                    x2={(optimalPoint.price / maxPrice) * 100}
                    y2={chartHeight}
                    className="optimal-line"
                  />
                )}
              </svg>

              <div className="x-labels">
                {[0, 1, 2, 3].map((mult) => (
                  <span key={mult} className="x-label">
                    ${Math.round(medianWTP * mult)}
                  </span>
                ))}
              </div>
            </div>

            <div className="summary">
              <div className="summary-label">Land revenue</div>
              <div className="summary-value">${Math.round(optimalPoint.price * optimalPoint.volume)}</div>
              <div className="summary-stats">
                <span>p* = ${Math.round(optimalPoint.price)}</span>
                <span>v = {(optimalPoint.volume * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <span className="legend-color volume" />
              <span>Volume (demand curve)</span>
            </div>
            {showRevenue && (
              <>
                <div className="legend-item">
                  <span className="legend-color revenue" />
                  <span>Revenue</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color optimal" />
                  <span>Optimal price</span>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="nrr-view">
            {/* Result summary at top */}
            <div className="nrr-result-bar">
              <div className="nrr-formula">
                <span className="formula-term">{(baseRetention * 100).toFixed(0)}%</span>
                <span className="formula-op">×</span>
                <span className="formula-term">{(expansionRate * 100).toFixed(0)}%</span>
                <span className="formula-op">×</span>
                <span className="formula-term">{(contractionRate * 100).toFixed(0)}%</span>
                <span className="formula-op">=</span>
              </div>
              <div className="nrr-result">
                <span className="nrr-value">{(baseRetention * expansionRate * contractionRate * 100).toFixed(0)}%</span>
                <span className="nrr-label">NRR</span>
                <span className="nrr-status" data-status={baseRetention * expansionRate * contractionRate >= 1 ? "good" : "warning"}>
                  {baseRetention * expansionRate * contractionRate >= 1 ? "Net positive" : "Net negative"}
                </span>
              </div>
            </div>

            {/* Distribution cards grid */}
            <div className="nrr-grid">
              <div className="nrr-card">
                <div className="nrr-card-header">
                  <span className="nrr-card-label">Retention</span>
                  <span className="nrr-card-value">{(baseRetention * 100).toFixed(0)}%</span>
                </div>
                <div className="nrr-card-chart">
                  <svg viewBox={`0 0 ${distWidth} ${distHeight}`} preserveAspectRatio="none">
                    <path d={retentionDistPath.area} className="nrr-dist-area" />
                    <path d={retentionDistPath.path} className="nrr-dist-line" />
                    <line x1={retentionDistPath.meanX} y1={0} x2={retentionDistPath.meanX} y2={distHeight} className="nrr-dist-mean" />
                  </svg>
                  <div className="nrr-chart-labels">
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="0.98"
                  step="0.01"
                  value={baseRetention}
                  onChange={(e) => setBaseRetention(Number(e.target.value))}
                  className="nrr-slider"
                />
              </div>

              <div className="nrr-card">
                <div className="nrr-card-header">
                  <span className="nrr-card-label">Expansion</span>
                  <span className="nrr-card-value">{(expansionRate * 100).toFixed(0)}%</span>
                </div>
                <div className="nrr-card-chart">
                  <svg viewBox={`0 0 ${distWidth} ${distHeight}`} preserveAspectRatio="none">
                    <path d={expansionDistPath.area} className="nrr-dist-area" />
                    <path d={expansionDistPath.path} className="nrr-dist-line" />
                    <line x1={expansionDistPath.meanX} y1={0} x2={expansionDistPath.meanX} y2={distHeight} className="nrr-dist-mean" />
                  </svg>
                  <div className="nrr-chart-labels">
                    <span>100%</span>
                    <span>140%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.3"
                  step="0.01"
                  value={expansionRate}
                  onChange={(e) => setExpansionRate(Number(e.target.value))}
                  className="nrr-slider"
                />
              </div>

              <div className="nrr-card">
                <div className="nrr-card-header">
                  <span className="nrr-card-label">Contraction</span>
                  <span className="nrr-card-value">{(contractionRate * 100).toFixed(0)}%</span>
                </div>
                <div className="nrr-card-chart">
                  <svg viewBox={`0 0 ${distWidth} ${distHeight}`} preserveAspectRatio="none">
                    <path d={contractionDistPath.area} className="nrr-dist-area" />
                    <path d={contractionDistPath.path} className="nrr-dist-line" />
                    <line x1={contractionDistPath.meanX} y1={0} x2={contractionDistPath.meanX} y2={distHeight} className="nrr-dist-mean" />
                  </svg>
                  <div className="nrr-chart-labels">
                    <span>80%</span>
                    <span>100%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.0"
                  step="0.01"
                  value={contractionRate}
                  onChange={(e) => setContractionRate(Number(e.target.value))}
                  className="nrr-slider"
                />
              </div>
            </div>
          </div>
        </>
        )}
      </div>

      <style jsx>{`
        .decomposition-visual {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          margin-bottom: var(--space-5);
          background: color-mix(in srgb, var(--fg) 6%, transparent);
          border-radius: 6px;
          padding: 2px;
          width: fit-content;
        }

        .view-toggle button {
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .view-toggle button.active {
          background: var(--fg);
          color: var(--bg);
        }

        .view-toggle button:hover:not(.active) {
          color: var(--fg);
        }

        .content-area {
          min-height: 280px;
        }

        .controls {
          display: flex;
          gap: var(--space-5);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
          align-items: center;
        }

        .control {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .control-label {
          font-size: 12px;
          color: var(--muted);
          min-width: 120px;
        }

        .control input[type="range"] {
          width: 80px;
          accent-color: var(--fg);
        }

        .toggle-control {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 12px;
          color: var(--muted);
          cursor: pointer;
        }

        .toggle-control input {
          accent-color: var(--fg);
        }

        .chart-area {
          display: flex;
          gap: var(--space-4);
          align-items: flex-end;
        }

        .y-axis-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 11px;
          color: var(--muted);
          margin-right: var(--space-2);
          align-self: center;
        }

        .chart {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chart-svg {
          width: 100%;
          height: ${chartHeight}px;
        }

        .area-fill {
          fill: color-mix(in srgb, var(--fg) 12%, transparent);
        }

        .line {
          fill: none;
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }

        .volume-line {
          stroke: var(--fg);
        }

        .revenue-line {
          stroke: var(--fg);
          stroke-dasharray: 6 3;
        }

        .optimal-line {
          stroke: var(--fg);
          stroke-width: 1;
          stroke-dasharray: 4 2;
          vector-effect: non-scaling-stroke;
        }

        .x-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .x-label {
          font-size: 10px;
          color: var(--muted);
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

        .summary-stats {
          display: flex;
          gap: var(--space-3);
          font-size: 11px;
          color: var(--muted);
          margin-top: var(--space-2);
        }

        /* NRR View Styles */
        .nrr-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .nrr-result-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--fg);
          color: var(--bg);
          border-radius: 6px;
        }

        .nrr-formula {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .formula-term {
          font-family: var(--font-geist-mono), monospace;
          font-size: 14px;
          font-weight: 500;
          opacity: 0.8;
        }

        .formula-op {
          font-size: 12px;
          opacity: 0.5;
        }

        .nrr-result {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .nrr-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 28px;
          font-weight: 700;
        }

        .nrr-label {
          font-family: var(--font-geist-mono), monospace;
          font-size: 28px;
          font-weight: 700;
          margin-left: 6px;
        }

        .nrr-status {
          font-size: 10px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .nrr-status[data-status="good"] {
          background: rgba(34, 197, 94, 0.25);
          color: #22c55e;
        }

        .nrr-status[data-status="warning"] {
          background: rgba(239, 68, 68, 0.25);
          color: #ef4444;
        }

        .nrr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }

        .nrr-card {
          display: flex;
          flex-direction: column;
          padding: var(--space-3);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
        }

        .nrr-card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-2);
        }

        .nrr-card-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--muted);
        }

        .nrr-card-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 20px;
          font-weight: 600;
        }

        .nrr-card-chart {
          position: relative;
          margin-bottom: var(--space-2);
        }

        .nrr-card-chart svg {
          width: 100%;
          height: 96px;
          display: block;
        }

        .nrr-dist-area {
          fill: color-mix(in srgb, var(--fg) 8%, transparent);
        }

        .nrr-dist-line {
          fill: none;
          stroke: var(--fg);
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }

        .nrr-dist-mean {
          stroke: var(--fg);
          stroke-width: 1;
          stroke-dasharray: 3 2;
          vector-effect: non-scaling-stroke;
          opacity: 0.6;
        }

        .nrr-chart-labels {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-geist-mono), monospace;
          font-size: 9px;
          color: var(--muted);
          margin-top: 4px;
        }

        .nrr-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: color-mix(in srgb, var(--fg) 12%, transparent);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .nrr-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: var(--fg);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .nrr-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .nrr-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--fg);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        @media (max-width: 600px) {
          .nrr-result-bar {
            flex-direction: column;
            gap: var(--space-3);
            text-align: center;
          }

          .nrr-formula {
            justify-content: center;
          }

          .nrr-grid {
            grid-template-columns: 1fr;
          }
        }

        .legend {
          display: flex;
          gap: var(--space-5);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
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
          height: 3px;
          border-radius: 1px;
        }

        .legend-color.volume {
          background: var(--fg);
        }

        .legend-color.revenue {
          background: repeating-linear-gradient(
            to right,
            var(--fg) 0px,
            var(--fg) 4px,
            transparent 4px,
            transparent 6px
          );
        }

        .legend-color.optimal {
          background: transparent;
          border: none;
          width: 12px;
          height: 12px;
          position: relative;
        }

        .legend-color.optimal::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 0;
          width: 2px;
          height: 12px;
          background: repeating-linear-gradient(
            to bottom,
            var(--fg) 0px,
            var(--fg) 4px,
            transparent 4px,
            transparent 6px
          );
          border-radius: 1px;
        }

        @media (max-width: 700px) {
          .controls {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }

          .chart-area {
            flex-direction: column;
            align-items: stretch;
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

          .summary-stats {
            margin-top: 0;
            margin-left: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
}
