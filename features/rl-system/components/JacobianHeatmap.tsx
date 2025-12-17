"use client";

import { useState, useMemo, Fragment } from "react";

const labels = ["Price", "Volume", "Retention", "Expansion", "Contraction"];

// Block membership: 0-1 = Acquisition, 2-4 = Post-sale
const getBlock = (i: number) => i < 2 ? "acquisition" : "postSale";

// Base elasticities (diagonal) and typical cross-elasticities
// Rows = ∂ log row / ∂ log col
const baseMatrix = [
  [1.0, 0, 0, 0, 0],        // p: only self
  [-2.0, 1.0, 0, 0, 0],     // v: strong negative from p
  [0, 0.3, 1.0, 0.1, -0.1], // r: weak from v, slight from e/c
  [0, 0.2, 0.2, 1.0, 0],    // e: weak from v, r
  [0, -0.1, -0.3, 0, 1.0],  // c: inverse of r influences
];

export function JacobianHeatmap() {
  const [coupling, setCoupling] = useState(0.5);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const matrix = useMemo(() => {
    return baseMatrix.map((row, i) =>
      row.map((val, j) => {
        if (i === j) return val; // diagonal unchanged
        return val * coupling * 2; // scale off-diagonal by coupling
      })
    );
  }, [coupling]);

  const getColor = (val: number) => {
    const absVal = Math.min(Math.abs(val), 2);
    const intensity = absVal / 2;
    if (val > 0.05) {
      return `rgba(34, 197, 94, ${0.2 + intensity * 0.7})`; // green
    } else if (val < -0.05) {
      return `rgba(239, 68, 68, ${0.2 + intensity * 0.7})`; // red
    }
    return "rgba(0, 0, 0, 0.03)"; // near zero
  };

  const getTextColor = (val: number) => {
    const absVal = Math.abs(val);
    return absVal > 0.8 ? "#fff" : "var(--fg)";
  };

  return (
    <div className="jacobian-container">
      <div className="jacobian-header">
        <span>CLV Elasticity Matrix</span>
        <div className="slider-container">
          <label>Coupling strength</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={coupling}
            onChange={(e) => setCoupling(Number(e.target.value))}
          />
          <span className="slider-value">{(coupling * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="matrix-grid">
        {/* Corner cell */}
        <div className="cell corner"></div>
        {/* Column headers */}
        {labels.map((label, j) => (
          <div 
            key={label} 
            className={`cell header-cell ${j === 2 ? "block-start" : ""} ${hoveredBlock === getBlock(j) ? "block-highlight" : ""}`}
            onMouseEnter={() => setHoveredBlock(getBlock(j))}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {label}
          </div>
        ))}

        {/* Matrix rows */}
        {matrix.map((row, i) => (
          <Fragment key={i}>
            <div 
              className={`cell row-header ${i === 2 ? "block-start" : ""} ${hoveredBlock === getBlock(i) ? "block-highlight" : ""}`}
              onMouseEnter={() => setHoveredBlock(getBlock(i))}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              {labels[i]}
            </div>
            {row.map((val, j) => (
              <div
                key={j}
                className={`cell value-cell ${i === j ? "diagonal" : ""} ${
                  getBlock(i) === getBlock(j) ? "same-block" : "cross-block"
                } ${i === 2 ? "block-row-start" : ""} ${j === 2 ? "block-col-start" : ""} ${
                  hoveredBlock && (getBlock(i) === hoveredBlock || getBlock(j) === hoveredBlock) ? "block-highlight" : ""
                }`}
                style={{
                  backgroundColor: getColor(val),
                  color: getTextColor(val),
                }}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: "rgba(34, 197, 94, 0.7)" }}></span>
          <span>Positive (complementary)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: "rgba(239, 68, 68, 0.7)" }}></span>
          <span>Negative (substitutes)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: "rgba(0, 0, 0, 0.05)", border: "1px solid var(--border)" }}></span>
          <span>Near zero (decoupled)</span>
        </div>
      </div>

      <div className="block-labels">
        <span className="block-label acquisition">Acquisition</span>
        <span className="block-label post-sale">Post-sale</span>
      </div>

      <style jsx>{`
        .jacobian-container {
          margin: var(--space-6) 0;
          padding: var(--space-5);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
        }

        .jacobian-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .jacobian-header > span {
          font-weight: 600;
          font-size: 14px;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 12px;
        }

        .slider-container label {
          color: var(--muted);
        }

        .slider-container input[type="range"] {
          flex: 1;
          max-width: 300px;
          accent-color: var(--fg);
        }

        .slider-value {
          font-family: var(--font-geist-mono), monospace;
          min-width: 40px;
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: minmax(90px, 0.9fr) repeat(5, 1fr);
          gap: 2px;
          width: 100%;
        }

        .cell {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          border-radius: 4px;
          transition: opacity 0.15s ease;
        }

        .corner {
          background: transparent;
        }

        .header-cell {
          background: var(--fg);
          color: var(--bg);
          font-size: 11px;
          font-weight: 500;
          cursor: default;
        }

        .header-cell.block-start {
          margin-left: 4px;
        }

        .row-header {
          background: var(--fg);
          color: var(--bg);
          font-size: 11px;
          font-weight: 500;
          cursor: default;
        }

        .row-header.block-start {
          margin-top: 4px;
        }

        .value-cell.diagonal {
          font-weight: 600;
        }

        .value-cell.cross-block {
          opacity: 0.85;
        }

        .value-cell.block-row-start {
          margin-top: 4px;
        }

        .value-cell.block-col-start {
          margin-left: 4px;
        }

        /* Block highlight on hover */
        .cell.block-highlight {
          opacity: 1;
        }

        .jacobian-container:has(.block-highlight) .cell:not(.block-highlight):not(.corner) {
          opacity: 0.4;
        }

        .legend {
          display: flex;
          gap: var(--space-5);
          margin-top: var(--space-5);
          font-size: 11px;
          color: var(--muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .legend-color {
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }

        .block-labels {
          display: flex;
          gap: var(--space-4);
          margin-top: var(--space-4);
          font-size: 11px;
        }

        .block-label {
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 500;
        }

        .block-label.acquisition {
          background: color-mix(in srgb, var(--fg) 10%, transparent);
        }

        .block-label.post-sale {
          background: color-mix(in srgb, var(--fg) 10%, transparent);
        }

        .block-labels::before {
          content: "Subsystems:";
          color: var(--muted);
          align-self: center;
        }
      `}</style>
    </div>
  );
}
