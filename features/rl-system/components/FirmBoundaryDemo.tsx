"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "internal" | "crossing";
  crossed: boolean;
  opacity: number;
}

interface Reward {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  positive: boolean;
  opacity: number;
}

export function FirmBoundaryDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rewardsRef = useRef<Reward[]>([]);
  const animationRef = useRef<number>(0);
  
  // Use refs for animation values to avoid restarting
  const bureaucracyRef = useRef(50);
  const executionRef = useRef(50);
  
  // State just for UI display
  const [bureaucracy, setBureaucracy] = useState(50);
  const [execution, setExecution] = useState(50);

  // Update refs when state changes
  const handleBureaucracyChange = (value: number) => {
    setBureaucracy(value);
    bureaucracyRef.current = value;
  };

  const handleExecutionChange = (value: number) => {
    setExecution(value);
    executionRef.current = value;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    // Dimensions - centered with equal padding, much more space between
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    const firmRadius = Math.min(width, height) * 0.26;
    const customerRadius = 24;
    const gap = 260; // Large gap between company and customer
    
    // Calculate positions for equal padding
    const totalContentWidth = firmRadius * 2 + customerRadius * 2 + gap;
    const startX = (width - totalContentWidth) / 2;
    
    const firmCenterX = startX + firmRadius;
    const firmCenterY = height * 0.5;
    const customerX = startX + totalContentWidth - customerRadius;
    const customerY = height * 0.5;

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = [];
      const maxParticles = 22; // Max internal + crossing
      
      for (let i = 0; i < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * firmRadius * 0.7;
        particles.push({
          id: i,
          x: firmCenterX + Math.cos(angle) * r,
          y: firmCenterY + Math.sin(angle) * r,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          type: i < 20 ? "internal" : "crossing",
          crossed: false,
          opacity: 1,
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Get current slider values from refs
      const currentBureaucracy = bureaucracyRef.current;
      const currentExecution = executionRef.current;

      // Crossing probability based on execution (higher = much more likely to cross)
      const crossProbability = 0.005 + (currentExecution / 100) * 0.35;
      
      // How many internal particles should be visible based on bureaucracy
      const visibleInternalCount = Math.floor(5 + (currentBureaucracy / 100) * 15);

      // Draw firm boundary
      ctx.beginPath();
      ctx.arc(firmCenterX, firmCenterY, firmRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.fill();

      // Draw "COMPANY" label
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.fillText("COMPANY", firmCenterX, firmCenterY - firmRadius - 12);

      // Draw customer
      ctx.beginPath();
      ctx.arc(customerX, customerY, customerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();

      // Customer icon (simple person)
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(customerX, customerY - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(customerX, customerY + 8, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw "CUSTOMER" label
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.fillText("CUSTOMER", customerX, customerY + 48);

      // Update and draw particles
      particlesRef.current.forEach((p, index) => {
        // Skip internal particles beyond the visible count
        if (p.type === "internal" && index >= visibleInternalCount && !p.crossed) {
          return;
        }

        if (p.crossed) {
          // Move toward customer then fade
          const dx = customerX - p.x;
          const dy = customerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 30) {
            p.x += (dx / dist) * 3;
            p.y += (dy / dist) * 3;
          } else {
            p.opacity -= 0.03;
            
            // Spawn reward when action arrives
            if (p.opacity <= 0.97 && p.opacity > 0.94) {
              // More bureaucracy = higher chance of negative reward
              const negativeChance = 0.1 + (currentBureaucracy / 100) * 0.6; // 10% to 70% negative
              const isPositive = Math.random() > negativeChance;
              rewardsRef.current.push({
                x: customerX,
                y: customerY,
                targetX: firmCenterX + firmRadius - 10,
                targetY: firmCenterY + (Math.random() - 0.5) * 40,
                positive: isPositive,
                opacity: 1,
              });
            }
          }

          // Reset when faded
          if (p.opacity <= 0) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * firmRadius * 0.5;
            p.x = firmCenterX + Math.cos(angle) * r;
            p.y = firmCenterY + Math.sin(angle) * r;
            p.vx = (Math.random() - 0.5) * 1.5;
            p.vy = (Math.random() - 0.5) * 1.5;
            p.crossed = false;
            p.opacity = 1;
          }
        } else {
          // Move inside firm
          p.x += p.vx;
          p.y += p.vy;

          // Check boundary collision
          const dx = p.x - firmCenterX;
          const dy = p.y - firmCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > firmRadius - 8) {
            if (p.type === "crossing" && dx > 0 && Math.random() < crossProbability) {
              // Cross the boundary!
              p.crossed = true;
            } else {
              // Bounce back
              const nx = dx / dist;
              const ny = dy / dist;
              const dot = p.vx * nx + p.vy * ny;
              p.vx -= 2 * dot * nx;
              p.vy -= 2 * dot * ny;
              p.x = firmCenterX + (firmRadius - 10) * nx;
              p.y = firmCenterY + (firmRadius - 10) * ny;
            }
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        if (p.crossed) {
          ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        } else {
          ctx.fillStyle = p.type === "crossing" ? "#000" : "#9ca3af";
        }
        ctx.fill();
      });

      // Update and draw rewards
      rewardsRef.current = rewardsRef.current.filter((r) => {
        const dx = r.targetX - r.x;
        const dy = r.targetY - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          r.x += (dx / dist) * 2.5;
          r.y += (dy / dist) * 2.5;
        } else {
          r.opacity -= 0.05;
        }

        // Draw reward - green for positive, red for negative
        if (r.opacity > 0) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, 5, 0, Math.PI * 2);
          const color = r.positive 
            ? `rgba(34, 197, 94, ${r.opacity})` 
            : `rgba(239, 68, 68, ${r.opacity})`;
          ctx.fillStyle = color;
          ctx.fill();
        }

        return r.opacity > 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []); // Empty deps - animation runs once, reads from refs

  return (
    <div className="demo">
      <div className="controls">
        <div className="slider-group">
          <label>
            <span className="label-text">Bureaucracy</span>
            <span className="label-value">{bureaucracy}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={bureaucracy}
            onChange={(e) => handleBureaucracyChange(Number(e.target.value))}
          />
        </div>
        <div className="slider-group">
          <label>
            <span className="label-text">Execution</span>
            <span className="label-value">{execution}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={execution}
            onChange={(e) => handleExecutionChange(Number(e.target.value))}
          />
        </div>
      </div>

      <canvas ref={canvasRef} className="canvas" />

      <div className="caption">
        <span className="dot internal" /> Internal work
        <span className="sep">·</span>
        <span className="dot action" /> Actions
        <span className="sep">·</span>
        <span className="dot reward-pos" /> <span className="dot reward-neg" /> Rewards
      </div>

      <style jsx>{`
        .demo {
          position: relative;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
        }

        .controls {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .canvas {
          width: 100%;
          height: 180px;
          display: block;
        }

        .caption {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: var(--muted);
          margin-top: 12px;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
        }

        .slider-group label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
        }

        .label-text {
          color: var(--fg);
        }

        .label-value {
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
        }

        .slider-group input[type="range"] {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .slider-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.internal {
          background: #9ca3af;
        }

        .dot.action {
          background: #000;
        }

        .dot.reward-pos {
          background: #22c55e;
        }

        .dot.reward-neg {
          background: #ef4444;
          margin-left: -4px;
        }

        .sep {
          color: var(--border);
        }

        @media (max-width: 480px) {
          .controls {
            position: static;
            flex-direction: row;
            gap: 16px;
            margin-bottom: 12px;
          }
          
          .slider-group {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
