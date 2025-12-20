"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const StateSpaceVisual3D = dynamic(
  () => import("./StateSpaceVisual3D").then((mod) => mod.StateSpaceVisual3D),
  { ssr: false, loading: () => <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading 3D...</div> }
);

// Customer trajectory through state space
const trajectory = [
  { x: 0.12, y: 0.85 },
  { x: 0.2, y: 0.72 },
  { x: 0.32, y: 0.58 },
  { x: 0.44, y: 0.48 },
  { x: 0.54, y: 0.38 },
  { x: 0.66, y: 0.3 },
  { x: 0.78, y: 0.22 },
  { x: 0.88, y: 0.15 },
];

// Value function: higher toward bottom-right
function valueAt(x: number, y: number): number {
  const s1 = x;
  const s2 = 1 - y;
  return 0.3 * s1 + 0.5 * s2 + 0.2 * s1 * s2;
}

// Green → White → Red color scale
function valueToColor(v: number): string {
  const t = Math.min(1, Math.max(0, v));
  
  if (t >= 0.5) {
    // White to green (0.5 → 1.0)
    const p = (t - 0.5) * 2;
    const r = Math.round(255 - p * 200);
    const g = Math.round(255 - p * 60);
    const b = Math.round(255 - p * 180);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Red to white (0.0 → 0.5)
    const p = t * 2;
    const r = Math.round(220 + p * 35);
    const g = Math.round(80 + p * 175);
    const b = Math.round(80 + p * 175);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function StateSpaceVisual() {
  const [is3D, setIs3D] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentPointIndex((prev) => (prev + 1) % trajectory.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Generate grid
  const gridSize = 32;
  const cells: { x: number; y: number; value: number }[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = (i + 0.5) / gridSize;
      const y = (j + 0.5) / gridSize;
      cells.push({ x, y, value: valueAt(x, y) });
    }
  }

  const width = 480;
  const height = 400;
  const paddingLeft = 70;
  const paddingRight = 70;
  const paddingTop = 40;
  const paddingBottom = 60;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const toSvgX = (x: number) => paddingLeft + x * plotWidth;
  const toSvgY = (y: number) => paddingTop + y * plotHeight;

  const pathD = trajectory
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
    .join(" ");

  const currentPoint = trajectory[currentPointIndex];
  const currentValue = valueAt(currentPoint.x, currentPoint.y);
  const s1Display = currentPoint.x.toFixed(2);
  const s2Display = (1 - currentPoint.y).toFixed(2);

  if (is3D) {
    return (
      <div className="state-space-container">
        <div className="toggle-row">
          <button className="toggle-btn" onClick={() => setIs3D(false)}>
            2D
          </button>
          <button className="toggle-btn active" onClick={() => setIs3D(true)}>
            3D
          </button>
        </div>
        <StateSpaceVisual3D />
        <style jsx>{`
          .state-space-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-3);
            margin: var(--space-6) 0;
          }
          .toggle-row {
            display: flex;
            gap: 4px;
            background: var(--surface);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid var(--border);
          }
          .toggle-btn {
            padding: 6px 16px;
            font-size: 13px;
            font-weight: 500;
            border: none;
            background: transparent;
            color: var(--muted);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .toggle-btn:hover {
            color: var(--fg);
          }
          .toggle-btn.active {
            background: var(--fg);
            color: var(--bg);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="state-space-container">
      <div className="toggle-row">
        <button className="toggle-btn active" onClick={() => setIs3D(false)}>
          2D
        </button>
        <button className="toggle-btn" onClick={() => setIs3D(true)}>
          3D
        </button>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="state-space-svg"
      >
        {/* Background */}
        <rect
          x={paddingLeft}
          y={paddingTop}
          width={plotWidth}
          height={plotHeight}
          fill="var(--bg)"
          rx="4"
        />

        {/* Value field */}
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={toSvgX(cell.x) - plotWidth / gridSize / 2}
            y={toSvgY(cell.y) - plotHeight / gridSize / 2}
            width={plotWidth / gridSize + 0.5}
            height={plotHeight / gridSize + 0.5}
            fill={valueToColor(cell.value)}
            opacity={0.85}
          />
        ))}

        {/* Border */}
        <rect
          x={paddingLeft}
          y={paddingTop}
          width={plotWidth}
          height={plotHeight}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          rx="4"
        />

        {/* Trajectory path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />

        {/* Trajectory points */}
        {trajectory.map((point, idx) => (
          <g key={idx}>
            <circle
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r={idx === currentPointIndex ? 10 : 5}
              fill="rgba(0,0,0,0.3)"
              transform="translate(1, 1)"
            />
            <circle
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r={idx === currentPointIndex ? 10 : 5}
              fill={idx <= currentPointIndex ? "var(--fg)" : "rgba(255,255,255,0.8)"}
              stroke="var(--fg)"
              strokeWidth={idx === currentPointIndex ? 3 : 1.5}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onMouseEnter={() => setIsAnimating(false)}
              onMouseLeave={() => setIsAnimating(true)}
            />
          </g>
        ))}

        {/* Pulse on current point */}
        <motion.circle
          cx={toSvgX(currentPoint.x)}
          cy={toSvgY(currentPoint.y)}
          r={16}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="2"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />

        {/* X-axis label */}
        <text
          x={paddingLeft + plotWidth / 2}
          y={height - 15}
          fontSize="13"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          textAnchor="middle"
          fontWeight="500"
        >
          State factor 1
        </text>

        {/* Y-axis label */}
        <text
          x={20}
          y={paddingTop + plotHeight / 2}
          fontSize="13"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          textAnchor="middle"
          fontWeight="500"
          transform={`rotate(-90, 20, ${paddingTop + plotHeight / 2})`}
        >
          State factor 2
        </text>

        {/* Colorbar */}
        <defs>
          <linearGradient id="valueGradientNew" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={valueToColor(0.15)} />
            <stop offset="50%" stopColor={valueToColor(0.5)} />
            <stop offset="100%" stopColor={valueToColor(0.95)} />
          </linearGradient>
        </defs>
        <rect
          x={width - paddingRight + 20}
          y={paddingTop}
          width={14}
          height={plotHeight}
          fill="url(#valueGradientNew)"
          rx="3"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x={width - paddingRight + 27}
          y={paddingTop - 10}
          fontSize="12"
          fill="var(--fg)"
          fontFamily="var(--font-geist-sans), system-ui"
          textAnchor="middle"
          fontWeight="500"
        >
          Value
        </text>
        <text
          x={width - paddingRight + 45}
          y={paddingTop + 12}
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          high
        </text>
        <text
          x={width - paddingRight + 45}
          y={paddingTop + plotHeight}
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-geist-sans), system-ui"
        >
          low
        </text>
      </svg>

      <div className="state-space-caption">
        <span className="state-label">
          Customer position: ({s1Display}, {s2Display})
        </span>
        <span className="state-divider">·</span>
        <span className="value-label">
          Value: {currentValue.toFixed(2)}
        </span>
      </div>

      <style jsx>{`
        .state-space-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin: var(--space-6) 0;
        }
        .toggle-row {
          display: flex;
          gap: 4px;
          background: var(--surface);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .toggle-btn {
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--muted);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toggle-btn:hover {
          color: var(--fg);
        }
        .toggle-btn.active {
          background: var(--fg);
          color: var(--bg);
        }
        .state-space-svg {
          display: block;
          max-width: 480px;
          width: 100%;
          height: auto;
        }
        .state-space-caption {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--muted);
        }
        .state-label, .value-label {
          background: var(--surface);
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }
        .state-divider {
          color: var(--border);
        }
      `}</style>
    </div>
  );
}
