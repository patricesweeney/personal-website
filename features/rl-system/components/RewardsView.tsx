"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const YEARS = [0, 1, 2, 3, 4, 5];
const NOMINAL_REVENUE = 100;

export function RewardsView() {
  const [gamma, setGamma] = useState(0.9);

  // Calculate present values and total CE
  const presentValues = YEARS.map((t) => NOMINAL_REVENUE * Math.pow(gamma, t));
  const customerEquity = presentValues.reduce((sum, pv) => sum + pv, 0);

  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Rewards</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A profit-seeking firm's objective is to maximize expected discounted free cash flow (enterprise value).<sup><a href="#ref-1" className="cite">1</a></sup> This decomposes into maximizing returns on invested capital and scaling the invested-capital base.<sup><a href="#ref-2" className="cite">2</a></sup>
          </p>

          <p>
            For early-stage SaaS, free cash flow is often negative, noisy, and lagging, so a workable proxy is <strong>customer equity</strong>,<sup><a href="#ref-3" className="cite">3</a></sup> expected discounted revenue from the present and future customer base. Accordingly, take revenue as the reward signal <InlineMath math="r_t" />. Therefore, a SaaS startup's policy objective is:
          </p>
          <BlockMath math="\pi^* \in \arg\max_{\pi}\ \mathbb{E}\!\left[\sum_{t=0}^{\infty}\gamma^{t} r_t \right], \qquad \gamma\in(0,1)" />
          <p>
            Here <InlineMath math="\pi" /> is the company's policy and <InlineMath math="\gamma" /> is its discount factor (hurdle rate/WACC, or equivalently an effective risk preference).
          </p>

          {/* Discount Visualization */}
          <div className="discount-viz">
            <div className="viz-header">
              <p className="muted" style={{ margin: 0 }}>
                $100 revenue per year — how much is each year worth today?
              </p>
            </div>

            <div className="bars-container">
              {YEARS.map((year, i) => {
                const pv = presentValues[i];
                const pvPercent = (pv / NOMINAL_REVENUE) * 100;
                
                return (
                  <div key={year} className="bar-wrapper">
                    <div className="bar-column">
                      {/* Nominal value (ghost bar) */}
                      <div className="bar-nominal" />
                      
                      {/* Present value (filled bar) */}
                      <motion.div
                        className="bar-present"
                        initial={{ height: "100%" }}
                        animate={{ height: `${pvPercent}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      
                      {/* Value label */}
                      <motion.div 
                        className="bar-value"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={pv.toFixed(0)}
                      >
                        ${pv.toFixed(0)}
                      </motion.div>
                    </div>
                    <div className="bar-label">t={year}</div>
                  </div>
                );
              })}
            </div>

            <div className="viz-controls">
              <div className="control-row">
                <label className="control-label">
                  <span className="meta">Discount Factor (γ)</span>
                  <span className="control-value">{gamma.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="control-slider"
                />
              </div>
              
              <motion.div 
                className="ce-display"
                key={customerEquity.toFixed(0)}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="meta">Customer Equity (6 years)</span>
                <span className="ce-value">${customerEquity.toFixed(0)}</span>
              </motion.div>
            </div>

            <p className="viz-insight muted">
              {gamma >= 0.9 
                ? "High γ: patient capital, future revenue nearly as valuable as today's."
                : gamma >= 0.75
                ? "Moderate γ: meaningful time preference, future revenue discounted."
                : "Low γ: impatient capital, distant revenue worth much less."}
            </p>
          </div>

          <p>
            The <strong>state-value function</strong> <InlineMath math="V^\pi(s)" /> is the expected discounted future revenue starting from state <InlineMath math="s" /> and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s \right]" />

          <p>
            The <strong>state-action value function</strong> <InlineMath math="Q^\pi(s,a)" /> is the expected discounted future revenue starting from state <InlineMath math="s" />, taking action <InlineMath math="a" /> immediately, and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_0 = a \right]" />

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1">Shaikh, A. (2016). <em>Capitalism: Competition, conflict, crises</em>. Oxford University Press.</li>
              <li id="ref-2">Koller, T., Goedhart, M., & Wessels, D. (2025). <em>Valuation: Measuring and managing the value of companies</em>. John Wiley & Sons.</li>
              <li id="ref-3">Rust, R. T., Lemon, K. N., & Zeithaml, V. A. (2004). Return on marketing: Using customer equity to focus marketing strategy. <em>Journal of Marketing</em>, 68(1), 109–127.</li>
            </ol>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cite {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.75em;
        }
        .cite:hover {
          color: var(--fg);
          text-decoration: underline;
        }
        
        /* Discount Visualization */
        .discount-viz {
          margin: var(--space-8) 0;
          padding: var(--space-6);
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg);
        }
        .viz-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .bars-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: var(--space-4);
          height: 180px;
          margin-bottom: var(--space-6);
        }
        .bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }
        .bar-column {
          position: relative;
          width: 48px;
          height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .bar-nominal {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: var(--border);
          border-radius: 4px 4px 0 0;
          opacity: 0.4;
        }
        .bar-present {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, #22c55e, #4ade80);
          border-radius: 4px 4px 0 0;
        }
        .bar-value {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 4px;
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-geist-mono), monospace;
          color: var(--fg);
          white-space: nowrap;
        }
        .bar-label {
          font-size: 12px;
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
        }
        
        .viz-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          max-width: 320px;
          margin: 0 auto var(--space-4);
        }
        .control-row {
          width: 100%;
        }
        .control-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-2);
        }
        .control-value {
          font-size: var(--font-small);
          font-weight: 600;
          font-family: var(--font-geist-mono), monospace;
        }
        .control-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .control-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--fg);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .control-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .control-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--fg);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .ce-display {
          text-align: center;
          padding: var(--space-3) var(--space-5);
          background: var(--border);
          border-radius: 8px;
        }
        .ce-display .meta {
          display: block;
          margin-bottom: var(--space-1);
        }
        .ce-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-geist-mono), monospace;
          color: #22c55e;
        }
        
        .viz-insight {
          text-align: center;
          font-size: var(--font-small);
          margin: 0;
        }
        
        @media (max-width: 500px) {
          .bars-container {
            gap: var(--space-2);
          }
          .bar-column {
            width: 36px;
          }
          .bar-value {
            font-size: 10px;
          }
        }
        
        .references-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: var(--space-10) 0 var(--space-6) 0;
        }
        .references {
          font-size: var(--font-small);
        }
        .references ol {
          margin: var(--space-3) 0 0 0;
          padding-left: var(--space-5);
          color: var(--muted);
        }
        .references li {
          margin-bottom: var(--space-2);
        }
      `}</style>
    </section>
  );
}
