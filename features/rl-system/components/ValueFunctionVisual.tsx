"use client";

import { useState, useMemo } from "react";

type StateId = "s1" | "s2" | "s3";

interface ActionValue {
  action: string;
  q: number;
}

interface StateData {
  id: StateId;
  label: string;
  v: number;
  actions: ActionValue[];
}

// Abstract state-action values
const states: StateData[] = [
  {
    id: "s1",
    label: "State 1",
    v: 85,
    actions: [
      { action: "Action 1", q: 92 },
      { action: "Action 2", q: 78 },
      { action: "Action 3", q: 85 },
    ],
  },
  {
    id: "s2",
    label: "State 2",
    v: 120,
    actions: [
      { action: "Action 1", q: 115 },
      { action: "Action 2", q: 135 },
      { action: "Action 3", q: 118 },
    ],
  },
  {
    id: "s3",
    label: "State 3",
    v: 45,
    actions: [
      { action: "Action 1", q: 62 },
      { action: "Action 2", q: 41 },
      { action: "Action 3", q: 48 },
    ],
  },
];

export function ValueFunctionVisual() {
  const [selectedState, setSelectedState] = useState<StateId>("s1");

  const currentState = states.find((s) => s.id === selectedState)!;

  const actionsWithAdvantage = useMemo(() => {
    return currentState.actions.map((a) => ({
      ...a,
      advantage: a.q - currentState.v,
    }));
  }, [currentState]);

  const maxQ = Math.max(...currentState.actions.map((a) => a.q));
  const maxAdvantage = Math.max(...actionsWithAdvantage.map((a) => Math.abs(a.advantage)));

  return (
    <div className="value-visual">
      <div className="state-selector">
        <span className="selector-label">Current state</span>
        <div className="state-buttons">
          {states.map((s) => (
            <button
              key={s.id}
              className={selectedState === s.id ? "active" : ""}
              onClick={() => setSelectedState(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="value-grid">
        {/* Baseline value */}
        <div className="v-section">
          <div className="section-header">
            <span className="fn-label">Baseline</span>
            <span className="fn-name">Expected value if I follow my usual policy</span>
          </div>
          <div className="v-value">{currentState.v}</div>
        </div>

        {/* Action values */}
        <div className="q-section">
          <div className="section-header">
            <span className="fn-label">Action values</span>
            <span className="fn-name">Expected value if I take this action first</span>
          </div>
          <div className="q-bars">
            {actionsWithAdvantage.map((a) => (
              <div key={a.action} className="q-row">
                <span className="action-label">{a.action}</span>
                <div className="q-bar-container">
                  <div
                    className="q-bar"
                    style={{ width: `${(a.q / maxQ) * 100}%` }}
                  >
                    <span className="q-value">{a.q}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantage */}
        <div className="a-section">
          <div className="section-header">
            <span className="fn-label">Advantage</span>
            <span className="fn-name">How much better or worse than baseline</span>
          </div>
          <div className="a-bars">
            {actionsWithAdvantage.map((a) => {
              // Scale from 20% (min for text) to 50% (full half)
              const minWidth = 20;
              const maxWidth = 50;
              const scaledWidth = maxAdvantage > 0 
                ? minWidth + (Math.abs(a.advantage) / maxAdvantage) * (maxWidth - minWidth)
                : minWidth;
              const isPositive = a.advantage >= 0;
              const isZero = a.advantage === 0;
              const valueText = `${isPositive ? "+" : ""}${a.advantage}`;
              
              return (
                <div key={a.action} className="a-row">
                  <span className="action-label">{a.action}</span>
                  <div className="a-bar-container">
                    <div className="a-center-line" />
                    {/* Bar with value inside */}
                    <div
                      className={`a-bar ${isZero ? "zero" : isPositive ? "positive" : "negative"}`}
                      style={{
                        width: `${scaledWidth}%`,
                        left: isPositive || isZero ? "50%" : "auto",
                        right: !isPositive && !isZero ? "50%" : "auto",
                        transform: isZero ? "translateX(-50%)" : "none",
                      }}
                    >
                      <span className="a-value">{valueText}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="a-axis-labels">
            <span>Worse than usual</span>
            <span>Better than usual</span>
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color baseline" />
          <span>Baseline = usual policy</span>
        </div>
        <div className="legend-item">
          <span className="legend-color positive" />
          <span>Beats the baseline</span>
        </div>
        <div className="legend-item">
          <span className="legend-color negative" />
          <span>Worse than baseline</span>
        </div>
      </div>

      <style jsx>{`
        .value-visual {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .state-selector {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .selector-label {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 12px;
          color: var(--muted);
        }

        .state-buttons {
          display: flex;
          gap: 2px;
          background: color-mix(in srgb, var(--fg) 6%, transparent);
          border-radius: 6px;
          padding: 2px;
        }

        .state-buttons button {
          padding: 6px 16px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .state-buttons button.active {
          background: var(--fg);
          color: var(--bg);
        }

        .state-buttons button:hover:not(.active) {
          color: var(--fg);
        }

        .value-grid {
          display: grid;
          grid-template-columns: 140px 1fr 1fr;
          gap: var(--space-4);
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: var(--space-3);
        }

        .fn-label {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
        }

        .fn-name {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 10px;
          color: var(--muted);
          line-height: 1.3;
        }

        /* Baseline Section */
        .v-section {
          display: flex;
          flex-direction: column;
          padding: var(--space-4);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
        }

        .v-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 36px;
          font-weight: 700;
          margin-top: var(--space-2);
        }

        /* Action values Section */
        .q-section {
          padding: var(--space-4);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
        }

        .q-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .q-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .action-label {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 11px;
          color: var(--muted);
          width: 60px;
          flex-shrink: 0;
        }

        .q-bar-container {
          flex: 1;
          height: 28px;
          background: color-mix(in srgb, var(--fg) 6%, transparent);
          border-radius: 4px;
          overflow: hidden;
        }

        .q-bar {
          height: 100%;
          background: var(--fg);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          transition: width 0.3s ease;
        }

        .q-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--bg);
        }

        /* Advantage Section */
        .a-section {
          padding: var(--space-4);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
        }

        .a-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .a-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .a-bar-container {
          flex: 1;
          height: 28px;
          position: relative;
          background: color-mix(in srgb, var(--fg) 6%, transparent);
          border-radius: 4px;
          overflow: hidden;
        }

        .a-center-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--muted);
          z-index: 2;
        }

        .a-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          transition: width 0.3s ease, left 0.3s ease, right 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .a-bar.positive {
          background: rgb(34, 197, 94);
          border-radius: 0 4px 4px 0;
        }

        .a-bar.negative {
          background: rgb(239, 68, 68);
          border-radius: 4px 0 0 4px;
        }

        .a-bar.zero {
          background: var(--muted);
          border-radius: 4px;
        }

        .a-value {
          font-family: var(--font-geist-mono), monospace;
          font-size: 11px;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          text-align: center;
        }

        .a-axis-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-3);
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 10px;
          color: var(--muted);
          padding: 0 var(--space-2);
        }

        .legend {
          display: flex;
          gap: var(--space-5);
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 11px;
          color: var(--muted);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-color.baseline {
          background: var(--fg);
        }

        .legend-color.positive {
          background: rgb(34, 197, 94);
        }

        .legend-color.negative {
          background: rgb(239, 68, 68);
        }

        @media (max-width: 700px) {
          .value-grid {
            grid-template-columns: 1fr;
          }

          .v-section {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .v-value {
            margin-top: 0;
          }

          .state-selector {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }
        }
      `}</style>
    </div>
  );
}
