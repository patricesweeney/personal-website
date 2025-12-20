"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

// Customer trajectory through state space
const trajectory = [
  { x: 0.15, y: 0.8 },   // Start: low engagement, low value
  { x: 0.25, y: 0.7 },
  { x: 0.35, y: 0.55 },
  { x: 0.45, y: 0.45 },
  { x: 0.55, y: 0.4 },
  { x: 0.65, y: 0.35 },
  { x: 0.75, y: 0.25 },
  { x: 0.85, y: 0.2 },   // End: high engagement, high value
];

// Value function: higher in bottom-right (high s1, low s2 inverted for display)
function valueAt(x: number, y: number): number {
  // V increases with s1 and s2 (y is inverted in SVG)
  const s1 = x;
  const s2 = 1 - y;
  return 0.3 * s1 + 0.5 * s2 + 0.2 * s1 * s2;
}

export function StateSpaceVisual() {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);

  // Animate through trajectory
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentPointIndex((prev) => (prev + 1) % trajectory.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Generate contour lines
  const contourLevels = [0.2, 0.35, 0.5, 0.65, 0.8];
  
  // Generate grid for value field visualization
  const gridSize = 20;
  const cells: { x: number; y: number; value: number }[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = (i + 0.5) / gridSize;
      const y = (j + 0.5) / gridSize;
      cells.push({ x, y, value: valueAt(x, y) });
    }
  }

  const width = 400;
  const height = 400;
  const padding = 50;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const toSvgX = (x: number) => padding + x * plotWidth;
  const toSvgY = (y: number) => padding + y * plotHeight;

  // Create path string for trajectory
  const pathD = trajectory
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
    .join(" ");

  // Color scale for value (green = high value)
  const valueToColor = (v: number) => {
    const t = Math.min(1, Math.max(0, v));
    const r = Math.round(30 + (1 - t) * 60);
    const g = Math.round(80 + t * 100);
    const b = Math.round(60 + (1 - t) * 40);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const currentPoint = trajectory[currentPointIndex];
  const currentValue = valueAt(currentPoint.x, currentPoint.y);

  return (
    <div className="state-space-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="state-space-svg"
        style={{ maxWidth: width, width: "100%", height: "auto" }}
      >
        <defs>
          <marker
            id="arrow-state"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="var(--muted)" />
          </marker>
        </defs>

        {/* Value field (heatmap cells) */}
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={toSvgX(cell.x) - plotWidth / gridSize / 2}
            y={toSvgY(cell.y) - plotHeight / gridSize / 2}
            width={plotWidth / gridSize}
            height={plotHeight / gridSize}
            fill={valueToColor(cell.value)}
            opacity={0.6}
          />
        ))}

        {/* Contour lines */}
        {contourLevels.map((level, idx) => {
          // Approximate contour as diagonal lines
          const offset = (1 - level) * 0.8;
          return (
            <line
              key={idx}
              x1={toSvgX(offset)}
              y1={toSvgY(1)}
              x2={toSvgX(1)}
              y2={toSvgY(offset)}
              stroke="var(--bg)"
              strokeWidth="1"
              strokeOpacity={0.5}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding + 10}
          y2={height - padding}
          stroke="var(--muted)"
          strokeWidth="1.5"
          markerEnd="url(#arrow-state)"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={padding}
          y2={padding - 10}
          stroke="var(--muted)"
          strokeWidth="1.5"
          markerEnd="url(#arrow-state)"
        />

        {/* Axis labels */}
        <text
          x={width - padding + 20}
          y={height - padding + 5}
          fontSize="14"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          fontStyle="italic"
        >
          s₁
        </text>
        <text
          x={padding - 5}
          y={padding - 20}
          fontSize="14"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          fontStyle="italic"
          textAnchor="middle"
        >
          s₂
        </text>

        {/* Customer trajectory path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Trajectory points */}
        {trajectory.map((point, idx) => (
          <circle
            key={idx}
            cx={toSvgX(point.x)}
            cy={toSvgY(point.y)}
            r={idx === currentPointIndex ? 8 : 4}
            fill={idx <= currentPointIndex ? "var(--fg)" : "var(--border)"}
            stroke="var(--bg)"
            strokeWidth="2"
            style={{ cursor: "pointer", transition: "r 0.2s, fill 0.2s" }}
            onMouseEnter={() => {
              setActivePoint(idx);
              setIsAnimating(false);
            }}
            onMouseLeave={() => {
              setActivePoint(null);
              setIsAnimating(true);
            }}
          />
        ))}

        {/* Current position indicator */}
        <motion.circle
          cx={toSvgX(currentPoint.x)}
          cy={toSvgY(currentPoint.y)}
          r={12}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="2"
          opacity={0.5}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Value colorbar */}
        <defs>
          <linearGradient id="valueGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={valueToColor(0.2)} />
            <stop offset="100%" stopColor={valueToColor(0.9)} />
          </linearGradient>
        </defs>
        <rect
          x={width - padding + 35}
          y={padding}
          width={12}
          height={plotHeight}
          fill="url(#valueGradient)"
          rx="2"
        />
        <text
          x={width - padding + 41}
          y={padding - 8}
          fontSize="11"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
          textAnchor="middle"
        >
          V
        </text>
        <text
          x={width - padding + 55}
          y={padding + 10}
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-mono), monospace"
        >
          high
        </text>
        <text
          x={width - padding + 55}
          y={height - padding}
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-mono), monospace"
        >
          low
        </text>
      </svg>

      <div className="state-space-info">
        <p className="meta">
          Customer at <InlineMath math={`s = (${(currentPoint.x).toFixed(2)}, ${(1 - currentPoint.y).toFixed(2)})`} /> · Value <InlineMath math={`V(s) = ${currentValue.toFixed(2)}`} />
        </p>
        <p className="muted" style={{ fontSize: "12px" }}>
          Hover over points to pause. The trajectory shows a customer moving through latent state space over time.
        </p>
      </div>

      <style jsx>{`
        .state-space-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          margin: var(--space-6) 0;
        }
        .state-space-svg {
          display: block;
        }
        .state-space-info {
          text-align: center;
          max-width: 400px;
        }
      `}</style>
    </div>
  );
}

