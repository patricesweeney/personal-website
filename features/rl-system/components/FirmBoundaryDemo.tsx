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

export function FirmBoundaryDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [crossCount, setCrossCount] = useState(0);

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

    // Dimensions
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    const firmCenterX = width * 0.35;
    const firmCenterY = height * 0.5;
    const firmRadius = Math.min(width, height) * 0.35;
    const customerX = width * 0.82;
    const customerY = height * 0.5;

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * firmRadius * 0.7;
        particles.push({
          id: i,
          x: firmCenterX + Math.cos(angle) * r,
          y: firmCenterY + Math.sin(angle) * r,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          type: i < 10 ? "internal" : "crossing",
          crossed: false,
          opacity: 1,
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    let crossings = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw firm boundary
      ctx.beginPath();
      ctx.arc(firmCenterX, firmCenterY, firmRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.fill();

      // Draw "FIRM" label
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.fillText("FIRM", firmCenterX, firmCenterY - firmRadius - 12);

      // Draw customer
      ctx.beginPath();
      ctx.arc(customerX, customerY, 24, 0, Math.PI * 2);
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
      particlesRef.current.forEach((p) => {
        if (p.crossed) {
          // Move toward customer then fade
          const dx = customerX - p.x;
          const dy = customerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 30) {
            p.x += (dx / dist) * 3;
            p.y += (dy / dist) * 3;
          } else {
            p.opacity -= 0.02;
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
            if (p.type === "crossing" && dx > 0 && Math.random() < 0.03) {
              // Cross the boundary!
              p.crossed = true;
              crossings++;
              setCrossCount(crossings);
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

      // Draw crossing arrow/path hint
      if (crossings === 0) {
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(firmCenterX + firmRadius + 10, firmCenterY);
        ctx.lineTo(customerX - 35, customerY);
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="demo">
      <canvas ref={canvasRef} className="canvas" />
      <div className="caption">
        <span className="dot internal" /> Internal work bounces inside
        <span className="sep">·</span>
        <span className="dot action" /> Actions cross the boundary
      </div>

      <style jsx>{`
        .demo {
          margin: var(--space-5) 0;
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

        .sep {
          color: var(--border);
        }
      `}</style>
    </div>
  );
}

