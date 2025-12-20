"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const elements = [
  {
    id: "company",
    label: "Company",
    description: "The decision-maker. Takes actions, watches what happens, updates its picture of the world, tries again.",
  },
  {
    id: "market",
    label: "Market",
    description: "Everything outside your control: customers, competitors, channels, constraints. You can't touch it directly—only poke it with actions and watch what comes back.",
  },
  {
    id: "observations",
    label: "Observations",
    description: "What you actually see: clicks, signups, churn, support tickets, survey responses, competitor moves. Noisy, partial, often late.",
  },
  {
    id: "rewards",
    label: "Rewards",
    description: "The score. Whatever number you're trying to make go up: revenue, retention, profit, or some proxy you've chosen to optimize.",
  },
  {
    id: "actions",
    label: "Actions",
    description: "What you can do: change the price, launch a campaign, tweak the onboarding, run an experiment, hire a rep.",
  },
];

interface RewardDot {
  id: number;
  isPositive: boolean;
}

export function SystemOverview() {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState(70);
  const [rewardDots, setRewardDots] = useState<RewardDot[]>([]);
  const [dotCounter, setDotCounter] = useState(0);

  const activeData = activeElement
    ? elements.find((e) => e.id === activeElement)
    : null;

  // Base duration for animations (modified by speed)
  const baseDuration = 2 / speed;
  const spawnInterval = 1500 / speed;

  // Spawn reward dots periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const isPositive = Math.random() * 100 < quality;
      const newDot: RewardDot = {
        id: dotCounter,
        isPositive,
      };
      setRewardDots((prev) => [...prev.slice(-5), newDot]); // Keep max 6 dots
      setDotCounter((c) => c + 1);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [quality, speed, dotCounter, spawnInterval]);

  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Philosophy</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            The default way to run a SaaS company is to find things that work, codify them into playbooks, and scale execution. But the market isn't static. Competitors copy you. Customers change. Channels saturate. Last year's playbook becomes this year's cargo cult.
          </p>
          <p>
            A better frame: treat the business as a <strong>learning system</strong>. You're an agent acting on an environment you don't fully understand. You try things, observe outcomes, update your model, try again. The goal isn't to discover the right playbook—it's to build an organization that learns faster than its environment changes.
          </p>
          <p>
            A SaaS business is a <strong>loop</strong>:
          </p>
          <ol className="loop-steps">
            <li>You take an <strong>action</strong> <InlineMath math="a" />—change a price, run a campaign, ship a feature.</li>
            <li>The world hands back <strong>observations</strong> <InlineMath math="o" />—clicks, signups, churn numbers, angry emails.</li>
            <li>You get a <strong>reward</strong> <InlineMath math="r" />—revenue went up, or it didn't.</li>
            <li>You update your picture of the <strong>state</strong> <InlineMath math="s" />—what's actually going on out there.</li>
            <li>You pick your next action. Repeat.</li>
          </ol>
          <p>
            The catch: you never see the state directly. You only get noisy readings, and you have to figure out what's actually going on from what you observe.
          </p>

          {/* Control Loop Diagram */}
          <div className="loop-container">
            <svg
              viewBox="0 0 500 280"
              className="loop-diagram"
              style={{ maxWidth: 500, width: "100%", height: "auto" }}
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
                  fill="var(--fg)"
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
                  fill="var(--fg)"
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
                  fill="var(--fg)"
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
                  fill="var(--fg)"
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
                  fill="var(--fg)"
                  style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans), system-ui" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  Actions
                </motion.text>
              </motion.g>

              {/* Observation flow dot */}
              <motion.circle
                r="3"
                fill="var(--fg)"
                animate={{
                  cx: [340, 165],
                  cy: [60, 60],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: baseDuration * 0.5,
                }}
              />

              {/* Action flow dot */}
              <motion.circle
                r="3"
                fill="var(--fg)"
                animate={{
                  cx: [160, 335],
                  cy: [220, 220],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: baseDuration * 0.75,
                  repeatDelay: baseDuration * 0.5,
                }}
              />

              {/* Reward dots (green/red based on quality) */}
              <AnimatePresence>
                {rewardDots.map((dot) => (
                  <motion.circle
                    key={dot.id}
                    r="4"
                    fill={dot.isPositive ? "#22c55e" : "#ef4444"}
                    initial={{ cx: 340, cy: 80, opacity: 0 }}
                    animate={{ 
                      cx: 165, 
                      cy: 80, 
                      opacity: [0, 1, 1, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: baseDuration,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </AnimatePresence>
            </svg>

            {/* Controls */}
            <div className="loop-controls">
              <div className="control-group">
                <label className="control-label">
                  <span className="meta">Speed</span>
                  <span className="control-value">{speed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="control-slider"
                />
              </div>
              <div className="control-group">
                <label className="control-label">
                  <span className="meta">Decision Quality</span>
                  <span className="control-value">{quality}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="control-slider"
                />
              </div>
            </div>

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
        .loop-steps {
          margin: var(--space-3) 0 var(--space-4) 0;
          padding-left: var(--space-5);
        }
        .loop-steps li {
          margin-bottom: var(--space-2);
        }
        .loop-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          margin: var(--space-8) 0;
        }
        .loop-diagram {
          display: block;
        }
        .loop-controls {
          display: flex;
          gap: var(--space-8);
          width: 100%;
          max-width: 500px;
          justify-content: center;
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
          max-width: 200px;
        }
        .control-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
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
        .loop-description {
          min-height: 60px;
          text-align: center;
          max-width: 500px;
        }
        @media (max-width: 500px) {
          .loop-controls {
            flex-direction: column;
            gap: var(--space-4);
          }
          .control-group {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
