"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const nodes = [
  {
    id: "perceive",
    label: "Perceive",
    description: "Observe the environment through noisy, partial measurements — impressions, clicks, leads, churn, qualitative signals.",
  },
  {
    id: "act",
    label: "Act",
    description: "Choose an intervention: launch a campaign, adjust pricing, change messaging, run an experiment.",
  },
  {
    id: "learn",
    label: "Learn",
    description: "Update beliefs about hidden states — demand, trust, willingness to pay — given new observations and rewards.",
  },
  {
    id: "optimize",
    label: "Optimize",
    description: "Refine the policy to select better actions that maximize expected cumulative reward.",
  },
];

export function PaloView() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [flowIndex, setFlowIndex] = useState(0);

  // Positions for circular layout (top, right, bottom, left)
  const positions = [
    { x: 150, y: 40 },   // Perceive - top
    { x: 260, y: 150 },  // Act - right
    { x: 150, y: 260 },  // Learn - bottom
    { x: 40, y: 150 },   // Optimize - left
  ];

  const activeData = activeNode
    ? nodes.find((n) => n.id === activeNode)
    : null;

  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Control Loop</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p className="muted" style={{ marginBottom: "var(--space-8)" }}>
            Perceive → Act → Learn → Optimize. The core decision-making cycle.
          </p>

          <div className="loop-container">
            <svg
              viewBox="0 0 300 300"
              className="loop-diagram"
              style={{ maxWidth: 400, width: "100%", height: "auto" }}
            >
              {/* Connection arrows */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="var(--muted)"
                  />
                </marker>
                <marker
                  id="arrowhead-active"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="var(--fg)"
                  />
                </marker>
              </defs>

              {/* Curved paths between nodes */}
              {[0, 1, 2, 3].map((i) => {
                const next = (i + 1) % 4;
                const from = positions[i];
                const to = positions[next];
                
                // Calculate control points for curved arrows
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const centerX = 150;
                const centerY = 150;
                
                // Push control point toward center for curve
                const ctrlX = midX + (centerX - midX) * 0.3;
                const ctrlY = midY + (centerY - midY) * 0.3;

                // Offset start and end points from node centers
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const startX = from.x + Math.cos(angle) * 35;
                const startY = from.y + Math.sin(angle) * 35;
                const endX = to.x - Math.cos(angle) * 35;
                const endY = to.y - Math.sin(angle) * 35;

                return (
                  <motion.path
                    key={i}
                    d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.2 }}
                  />
                );
              })}

              {/* Animated flow indicator */}
              <motion.circle
                r="4"
                fill="var(--fg)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  cx: positions.map(p => p.x),
                  cy: positions.map(p => p.y),
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.9, 1],
                }}
              />

              {/* Nodes */}
              {nodes.map((node, i) => {
                const pos = positions[i];
                const isActive = activeNode === node.id;

                return (
                  <g key={node.id}>
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r="30"
                      fill="var(--bg)"
                      stroke={isActive ? "var(--fg)" : "var(--border)"}
                      strokeWidth={isActive ? "2" : "1"}
                      style={{ cursor: "pointer" }}
                      whileHover={{ scale: 1.08 }}
                      onMouseEnter={() => setActiveNode(node.id)}
                      onMouseLeave={() => setActiveNode(null)}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    />
                    <motion.text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight={isActive ? "600" : "400"}
                      fill={isActive ? "var(--fg)" : "var(--muted)"}
                      style={{ 
                        pointerEvents: "none",
                        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                    >
                      {node.label}
                    </motion.text>
                  </g>
                );
              })}
            </svg>

            {/* Description panel */}
            <div className="loop-description">
              <motion.div
                key={activeNode || "default"}
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
                  <p className="muted">Hover over a node to see details.</p>
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
            flex-direction: row;
            align-items: flex-start;
            gap: var(--space-10);
          }
          .loop-description {
            text-align: left;
            flex: 1;
          }
        }
      `}</style>
    </section>
  );
}
