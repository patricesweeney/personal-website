"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const elements = [
  {
    id: "company",
    label: "Company",
    description: "The agent: makes decisions, runs experiments, updates beliefs, and refines strategy based on feedback.",
  },
  {
    id: "market",
    label: "Market",
    description: "The environment: customers, competitors, channels, and constraints. You never touch it directly — only through actions.",
  },
  {
    id: "observations",
    label: "Observations",
    description: "Noisy, partial measurements from the market: impressions, clicks, leads, demos, churn, qualitative feedback, competitor signals.",
  },
  {
    id: "rewards",
    label: "Rewards",
    description: "Scalar feedback encoding success: profit, ARR, NRR, LTV, retention, or a shaped proxy you optimize for.",
  },
  {
    id: "actions",
    label: "Actions",
    description: "Interventions you take: launch campaigns, adjust pricing, change messaging, run experiments, allocate budget.",
  },
];

export function PaloView() {
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const activeData = activeElement
    ? elements.find((e) => e.id === activeElement)
    : null;

  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Control Loop</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p className="muted" style={{ marginBottom: "var(--space-8)" }}>
            The agent-environment interaction. Hover to explore each component.
          </p>

          <div className="loop-container">
            <svg
              viewBox="0 0 500 280"
              className="loop-diagram"
              style={{ maxWidth: 600, width: "100%", height: "auto" }}
            >
              <defs>
                <marker
                  id="arrow-muted"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="var(--muted)" />
                </marker>
                <marker
                  id="arrow-active"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="var(--fg)" />
                </marker>
              </defs>

              {/* Company Box (Left) */}
              <motion.g
                onMouseEnter={() => setActiveElement("company")}
                onMouseLeave={() => setActiveElement(null)}
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.rect
                  x="40"
                  y="90"
                  width="120"
                  height="100"
                  rx="8"
                  fill="var(--bg)"
                  stroke={activeElement === "company" ? "var(--fg)" : "var(--border)"}
                  strokeWidth={activeElement === "company" ? "2" : "1"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.text
                  x="100"
                  y="145"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill={activeElement === "company" ? "var(--fg)" : "var(--muted)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  Company
                </motion.text>
              </motion.g>

              {/* Market Box (Right) */}
              <motion.g
                onMouseEnter={() => setActiveElement("market")}
                onMouseLeave={() => setActiveElement(null)}
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.rect
                  x="340"
                  y="90"
                  width="120"
                  height="100"
                  rx="8"
                  fill="var(--bg)"
                  stroke={activeElement === "market" ? "var(--fg)" : "var(--border)"}
                  strokeWidth={activeElement === "market" ? "2" : "1"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.text
                  x="400"
                  y="145"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill={activeElement === "market" ? "var(--fg)" : "var(--muted)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  Market
                </motion.text>
              </motion.g>

              {/* Top Arrow: Observations (Market → Company, right to left) */}
              <motion.g
                onMouseEnter={() => setActiveElement("observations")}
                onMouseLeave={() => setActiveElement(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.line
                  x1="340"
                  y1="60"
                  x2="165"
                  y2="60"
                  stroke={activeElement === "observations" ? "var(--fg)" : "var(--muted)"}
                  strokeWidth={activeElement === "observations" ? "2" : "1.5"}
                  markerEnd={activeElement === "observations" ? "url(#arrow-active)" : "url(#arrow-muted)"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
                <motion.text
                  x="252"
                  y="45"
                  textAnchor="middle"
                  fontSize="12"
                  fill={activeElement === "observations" ? "var(--fg)" : "var(--muted)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  Observations
                </motion.text>
              </motion.g>

              {/* Top Arrow: Rewards (Market → Company, right to left, below observations) */}
              <motion.g
                onMouseEnter={() => setActiveElement("rewards")}
                onMouseLeave={() => setActiveElement(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.line
                  x1="340"
                  y1="80"
                  x2="165"
                  y2="80"
                  stroke={activeElement === "rewards" ? "var(--fg)" : "var(--muted)"}
                  strokeWidth={activeElement === "rewards" ? "2" : "1.5"}
                  markerEnd={activeElement === "rewards" ? "url(#arrow-active)" : "url(#arrow-muted)"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
                <motion.text
                  x="252"
                  y="75"
                  textAnchor="middle"
                  fontSize="12"
                  fill={activeElement === "rewards" ? "var(--fg)" : "var(--muted)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  Rewards
                </motion.text>
              </motion.g>

              {/* Bottom Arrow: Actions (Company → Market, left to right) */}
              <motion.g
                onMouseEnter={() => setActiveElement("actions")}
                onMouseLeave={() => setActiveElement(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.line
                  x1="160"
                  y1="220"
                  x2="335"
                  y2="220"
                  stroke={activeElement === "actions" ? "var(--fg)" : "var(--muted)"}
                  strokeWidth={activeElement === "actions" ? "2" : "1.5"}
                  markerEnd={activeElement === "actions" ? "url(#arrow-active)" : "url(#arrow-muted)"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
                <motion.text
                  x="252"
                  y="245"
                  textAnchor="middle"
                  fontSize="12"
                  fill={activeElement === "actions" ? "var(--fg)" : "var(--muted)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  Actions
                </motion.text>
              </motion.g>

              {/* Animated flow dots */}
              <motion.circle
                r="3"
                fill="var(--fg)"
                animate={{
                  cx: [340, 165],
                  cy: [60, 60],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
              />
              <motion.circle
                r="3"
                fill="var(--fg)"
                animate={{
                  cx: [160, 335],
                  cy: [220, 220],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                  repeatDelay: 1,
                }}
              />
            </svg>

            {/* Description panel */}
            <div className="loop-description">
              <motion.div
                key={activeElement || "default"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeData ? (
                  <>
                    <p className="meta">{activeData.label}</p>
                    <p>{activeData.description}</p>
                  </>
                ) : (
                  <p className="muted">Hover over a component to see details.</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loop-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }
        .loop-diagram {
          display: block;
        }
        .loop-description {
          min-height: 80px;
          text-align: center;
          max-width: 500px;
        }
        @media (min-width: 768px) {
          .loop-container {
            flex-direction: column;
            align-items: center;
          }
          .loop-description {
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
