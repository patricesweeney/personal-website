"use client";

import { useState, useEffect } from "react";

interface CohortBlock {
  t: number;
  clv: number;
}

const cohorts: CohortBlock[] = [
  { t: 0, clv: 100 },
  { t: 1, clv: 105 },
  { t: 2, clv: 110 },
  { t: 3, clv: 116 },
  { t: 4, clv: 122 },
  { t: 5, clv: 128 },
];

const maxClv = Math.max(...cohorts.map((c) => c.clv));
const totalUndiscounted = cohorts.reduce((sum, c) => sum + c.clv, 0);

export function CustomerEquityVisual() {
  const [gamma, setGamma] = useState(0.9);
  const [mounted, setMounted] = useState(false);

  const discountRate = 1 - gamma;
  const isDiscounted = discountRate > 0.001;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getDiscountedValue = (clv: number, t: number) => {
    return clv * Math.pow(gamma, t);
  };

  const totalCE = cohorts.reduce(
    (sum, c) => sum + getDiscountedValue(c.clv, c.t),
    0
  );

  return (
    <div className="ce-visual">
      <div className="ce-header">
        <div className="ce-controls">
          <span className="gamma-label">
            Discount rate: {(discountRate * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0"
            max="0.15"
            step="0.01"
            value={discountRate}
            onChange={(e) => setGamma(1 - Number(e.target.value))}
          />
        </div>
      </div>

      <div className="chart-area">
        <div className="chart">
          <div className="bars">
            {cohorts.map((cohort, i) => {
              const discountedValue = getDiscountedValue(cohort.clv, cohort.t);
              const heightPercent = (discountedValue / maxClv) * 100;
              const originalHeightPercent = (cohort.clv / maxClv) * 100;
              const discountFactor = Math.pow(gamma, cohort.t);

              return (
                <div key={cohort.t} className="bar-column">
                  <div className="bar-wrapper">
                    {/* Ghost bar showing original height when discounted */}
                    {isDiscounted && (
                      <div
                        className="bar-ghost"
                        style={{ height: `${originalHeightPercent}%` }}
                      />
                    )}
                    <div
                      className={`bar ${mounted ? "visible" : ""}`}
                      style={{
                        height: `${heightPercent}%`,
                        transitionDelay: `${i * 60}ms`,
                      }}
                    >
                      <span className="bar-value">
                        ${Math.round(discountedValue)}
                      </span>
                    </div>
                  </div>
                  <span className="bar-label">{cohort.t}</span>
                  <span className="discount-label">
                    {(discountFactor * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="time-axis">
            <div className="axis-line" />
            <span className="axis-label">Time</span>
          </div>
        </div>

        <div className="summary">
          <div className="summary-label">
            {isDiscounted ? "Customer equity" : "Future value"}
          </div>
          <div className="summary-value">${Math.round(totalCE)}</div>
          <div className="summary-note">
            {isDiscounted
              ? `${Math.round(
                  ((totalUndiscounted - totalCE) / totalUndiscounted) * 100
                )}% less than FV`
              : "No discounting"}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ce-visual {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
        }

        .ce-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }

        .ce-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .gamma-label {
          font-size: 12px;
          color: var(--muted);
          min-width: 110px;
        }

        .ce-controls input[type="range"] {
          width: 120px;
          accent-color: var(--fg);
        }

        .chart-area {
          display: flex;
          gap: var(--space-6);
          align-items: flex-end;
        }

        .chart {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .bars {
          display: flex;
          align-items: flex-end;
          gap: var(--space-3);
          height: 160px;
          padding: 0 var(--space-2);
        }

        .bar-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar-wrapper {
          flex: 1;
          width: 100%;
          max-width: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          position: relative;
        }

        .bar-ghost {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: color-mix(in srgb, var(--fg) 8%, transparent);
          border: 1px dashed var(--border);
          border-radius: 4px 4px 0 0;
        }

        .bar {
          width: 100%;
          background: var(--fg);
          border-radius: 4px 4px 0 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 6px;
          position: relative;
          z-index: 1;
          height: 0;
          opacity: 0;
          transition:
            height 0.4s ease,
            opacity 0.3s ease;
        }

        .bar.visible {
          opacity: 1;
        }

        .bar-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          font-weight: 600;
          color: var(--bg);
        }

        .bar-label {
          font-family: var(--font-geist-mono), monospace;
          font-size: 11px;
          color: var(--fg);
          margin-top: var(--space-2);
        }

        .discount-label {
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          color: var(--muted);
          margin-top: 2px;
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

        @media (max-width: 500px) {
          .ce-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .chart-area {
            flex-direction: column;
            align-items: stretch;
          }

          .bars {
            gap: var(--space-2);
            height: 120px;
          }

          .bar-wrapper {
            max-width: 36px;
          }

          .summary {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
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
