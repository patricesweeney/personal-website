"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

// Seeded random number generator
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Digamma function (derivative of log-gamma)
function digamma(x: number): number {
  if (x < 1) {
    // Recurrence: ψ(x) = ψ(x+1) - 1/x
    return digamma(x + 1) - 1 / x;
  }
  // Shift to larger x for asymptotic accuracy
  let result = 0;
  while (x < 6) {
    result -= 1 / x;
    x += 1;
  }
  // Asymptotic expansion
  const x2 = x * x;
  result += Math.log(x) - 1 / (2 * x);
  result -= 1 / (12 * x2);
  result += 1 / (120 * x2 * x2);
  result -= 1 / (252 * x2 * x2 * x2);
  return result;
}

// KL divergence: D_KL[Beta(α+1, β) || Beta(α, β)]
function klBetaAfterSuccess(alpha: number, beta: number): number {
  return Math.log((alpha + beta) / alpha) + digamma(alpha + 1) - digamma(alpha + beta + 1);
}

// KL divergence: D_KL[Beta(α, β+1) || Beta(α, β)]
function klBetaAfterFailure(alpha: number, beta: number): number {
  return Math.log((alpha + beta) / beta) + digamma(beta + 1) - digamma(alpha + beta + 1);
}

// Expected information gain: E_r[D_KL[p(θ|r) || p(θ)]]
function informationGain(alpha: number, beta: number): number {
  const mu = alpha / (alpha + beta);
  return mu * klBetaAfterSuccess(alpha, beta) + (1 - mu) * klBetaAfterFailure(alpha, beta);
}

// Log-gamma function for Beta sampling
function logGamma(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// Sample from Gamma(shape, 1) using Marsaglia-Tsang method
function sampleGamma(shape: number, rng: () => number): number {
  if (shape < 1) {
    return sampleGamma(1 + shape, rng) * Math.pow(rng(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do {
      x = gaussianRandom(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Box-Muller for Gaussian samples
function gaussianRandom(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Sample from Beta(alpha, beta)
function sampleBeta(alpha: number, betaParam: number, rng: () => number): number {
  const x = sampleGamma(alpha, rng);
  const y = sampleGamma(betaParam, rng);
  return x / (x + y);
}

// Monte Carlo estimate of P(θ_A > θ_B) for Beta posteriors
function probABest(alphaA: number, betaA: number, alphaB: number, betaB: number, nSamples = 2000): number {
  const rng = seededRandom(12345); // Fixed seed for consistency
  let count = 0;
  for (let i = 0; i < nSamples; i++) {
    const thetaA = sampleBeta(alphaA, betaA, rng);
    const thetaB = sampleBeta(alphaB, betaB, rng);
    if (thetaA > thetaB) count++;
  }
  return count / nSamples;
}

interface Observation {
  t: number;
  arm: "A" | "B";
  reward: 0 | 1;
  muA: number;
  muB: number;
  igA: number;
  igB: number;
  piA: number;
  piB: number;
  lambda: number; // log Bayes factor Λ_{A,B}
  pABest: number; // P(θ_A > θ_B)
  pBBest: number; // P(θ_B > θ_A)
}

export function BanditPolicyDemo() {
  // True rates (hidden from the "agent")
  const [trueRateA, setTrueRateA] = useState(0.6);
  const [trueRateB, setTrueRateB] = useState(0.45);

  // Policy parameters
  const [eta, setEta] = useState(1.0); // belief update precision
  const [beta, setBeta] = useState(3.0); // action selection precision
  const [lambdaWeight, setLambdaWeight] = useState(0.5); // information value λ
  const [delta, setDelta] = useState(0.05); // stopping threshold (error rate)

  // Simulation state
  const [seed, setSeed] = useState(42);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const maxSteps = 100;

  // Generate full trajectory
  const trajectory = useMemo(() => {
    const rng = seededRandom(seed);
    const observations: Observation[] = [];

    // Beta prior parameters
    let alphaA = 1,
      betaA = 1;
    let alphaB = 1,
      betaB = 1;

    for (let t = 0; t < maxSteps; t++) {
      // Posterior means
      const muA = alphaA / (alphaA + betaA);
      const muB = alphaB / (alphaB + betaB);

      // Information gain: E_r[D_KL[p(θ|r) || p(θ)]] (proper KL divergence)
      const igA = informationGain(alphaA, betaA);
      const igB = informationGain(alphaB, betaB);

      // Softmax policy: π(a) ∝ exp(β[μ(a) + λ·IG(a)])
      const scoreA = beta * (muA + lambdaWeight * igA);
      const scoreB = beta * (muB + lambdaWeight * igB);
      const maxScore = Math.max(scoreA, scoreB);
      const expA = Math.exp(scoreA - maxScore);
      const expB = Math.exp(scoreB - maxScore);
      const Z = expA + expB;
      const piA = expA / Z;
      const piB = expB / Z;

      // Select arm according to policy
      const selectA = rng() < piA;
      const arm: "A" | "B" = selectA ? "A" : "B";

      // Observe reward
      const trueRate = selectA ? trueRateA : trueRateB;
      const reward: 0 | 1 = rng() < trueRate ? 1 : 0;

      // Update posteriors (fractional Bayesian update with learning rate η)
      if (selectA) {
        if (reward === 1) alphaA += eta;
        else betaA += eta;
      } else {
        if (reward === 1) alphaB += eta;
        else betaB += eta;
      }

      // Compute updated values after posterior update
      const newMuA = alphaA / (alphaA + betaA);
      const newMuB = alphaB / (alphaB + betaB);
      const newIgA = informationGain(alphaA, betaA);
      const newIgB = informationGain(alphaB, betaB);

      // Log Bayes factor: Λ_{A,B} = β[(μ_A - μ_B) + λ(IG_A - IG_B)]
      // This is the log odds ratio from the softmax policy
      const logBayesFactor = beta * ((newMuA - newMuB) + lambdaWeight * (newIgA - newIgB));

      // Stopping rule: P(θ_A > θ_B) for best-arm identification
      const pABestVal = probABest(alphaA, betaA, alphaB, betaB, 1000);

      observations.push({
        t: t + 1,
        arm,
        reward,
        muA: newMuA,
        muB: newMuB,
        igA: newIgA,
        igB: newIgB,
        piA: expA / Z,
        piB: expB / Z,
        lambda: logBayesFactor,
        pABest: pABestVal,
        pBBest: 1 - pABestVal,
      });
    }

    return observations;
  }, [seed, trueRateA, trueRateB, eta, beta, lambdaWeight]);

  // Current state
  const current = currentStep > 0 ? trajectory[currentStep - 1] : null;
  const visibleTrajectory = trajectory.slice(0, currentStep);

  // Recompute policy for current posteriors with current β and λ
  const livePolicy = useMemo(() => {
    if (!current) return { piA: 0.5, piB: 0.5, scoreA: 0, scoreB: 0 };
    
    const scoreA = beta * (current.muA + lambdaWeight * current.igA);
    const scoreB = beta * (current.muB + lambdaWeight * current.igB);
    const maxScore = Math.max(scoreA, scoreB);
    const expA = Math.exp(scoreA - maxScore);
    const expB = Math.exp(scoreB - maxScore);
    const Z = expA + expB;
    
    return {
      piA: expA / Z,
      piB: expB / Z,
      scoreA: current.muA + lambdaWeight * current.igA,
      scoreB: current.muB + lambdaWeight * current.igB,
    };
  }, [current, beta, lambdaWeight]);

  // Auto-run
  useEffect(() => {
    if (isRunning && currentStep < maxSteps) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 80);
    } else if (currentStep >= maxSteps) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isRunning, currentStep]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(0);
    setSeed((s) => s + 1);
  }, []);

  const toggleRun = useCallback(() => {
    if (currentStep >= maxSteps) {
      setCurrentStep(0);
      setSeed((s) => s + 1);
    }
    setIsRunning((r) => !r);
  }, [currentStep]);

  // Scale for Λ trajectory
  const lambdaMax = Math.max(
    3,
    ...visibleTrajectory.map((o) => Math.abs(o.lambda))
  );

  return (
    <div className="demo">
      <div className="demo-header">
        <span>Evidence Accumulation & Softmax Policy</span>
      </div>

      <div className="demo-body">
        {/* Parameters */}
        <div className="params-row">
          <div className="params-left">
            <div className="param-group">
              <div className="param-label">True rate A</div>
              <input
                type="number"
                value={trueRateA}
                onChange={(e) =>
                  setTrueRateA(Math.max(0, Math.min(1, Number(e.target.value))))
                }
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="param-group">
              <div className="param-label">True rate B</div>
              <input
                type="number"
                value={trueRateB}
                onChange={(e) =>
                  setTrueRateB(Math.max(0, Math.min(1, Number(e.target.value))))
                }
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
          <div className="params-right">
            <div className="param-group slider-group">
              <div className="param-label">
                Learning rate <InlineMath math="\eta" /> = {eta.toFixed(1)}
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={eta}
                onChange={(e) => setEta(Number(e.target.value))}
              />
            </div>
            <div className="param-group slider-group">
              <div className="param-label">
                Precision <InlineMath math="\beta" /> = {beta.toFixed(1)}
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
              />
            </div>
            <div className="param-group slider-group">
              <div className="param-label">
                Info value <InlineMath math="\lambda" /> = {lambdaWeight.toFixed(2)}
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={lambdaWeight}
                onChange={(e) => setLambdaWeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="controls-row">
          <button className="control-btn" onClick={toggleRun}>
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? "Pause" : currentStep >= maxSteps ? "Restart" : "Run"}
          </button>
          <button className="control-btn secondary" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="step-display">
            Step {currentStep} / {maxSteps}
          </div>
        </div>

        {/* Main visualization */}
        <div className="viz-grid">
          {/* Policy bars */}
          <div className="policy-panel">
            <div className="panel-title">
              Policy <InlineMath math="\pi(a)" />
            </div>
            <div className="policy-bars">
              <div className="policy-bar-group">
                <div className="bar-label">A</div>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-a"
                    style={{ width: `${livePolicy.piA * 100}%` }}
                  />
                </div>
                <div className="bar-value">{(livePolicy.piA * 100).toFixed(0)}%</div>
              </div>
              <div className="policy-bar-group">
                <div className="bar-label">B</div>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-b"
                    style={{ width: `${livePolicy.piB * 100}%` }}
                  />
                </div>
                <div className="bar-value">{(livePolicy.piB * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Λ trajectory */}
          <div className="trajectory-panel">
            <div className="panel-title">
              Evidence <InlineMath math="\Lambda" />
            </div>
            <svg viewBox="0 0 280 120" className="trajectory-svg">
              {/* Background regions */}
              <rect x="0" y="0" width="280" height="40" fill="#22c55e" opacity="0.08" />
              <rect x="0" y="80" width="280" height="40" fill="#ef4444" opacity="0.08" />
              
              {/* Zero line */}
              <line x1="0" y1="60" x2="280" y2="60" stroke="var(--border)" strokeWidth="1" />
              
              {/* Trajectory */}
              {visibleTrajectory.length > 0 && (
                <path
                  d={`M 0,60 ${visibleTrajectory
                    .map((o) => {
                      const x = (o.t / maxSteps) * 280;
                      const y = 60 - (o.lambda / lambdaMax) * 50;
                      return `L ${x},${Math.max(5, Math.min(115, y))}`;
                    })
                    .join(" ")}`}
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth="1.5"
                />
              )}
              
              {/* Current point */}
              {current && (
                <circle
                  cx={(currentStep / maxSteps) * 280}
                  cy={Math.max(5, Math.min(115, 60 - (current.lambda / lambdaMax) * 50))}
                  r="4"
                  fill={current.lambda > 0.5 ? "#22c55e" : current.lambda < -0.5 ? "#ef4444" : "var(--fg)"}
                />
              )}
              
              {/* Labels */}
              <text x="4" y="14" fill="#22c55e" fontSize="9" fontFamily="var(--font-geist-mono)">
                A &gt; B
              </text>
              <text x="4" y="114" fill="#ef4444" fontSize="9" fontFamily="var(--font-geist-mono)">
                B &gt; A
              </text>
            </svg>
          </div>
        </div>

        {/* Posterior details */}
        <div className="posteriors-row">
          <div className="posterior-item">
            <div className="posterior-label">Belief A</div>
            <div className="posterior-bar-track">
              <div
                className="posterior-bar-fill"
                style={{ width: `${(current?.muA ?? 0.5) * 100}%` }}
              />
              <div
                className="true-marker"
                style={{ left: `${trueRateA * 100}%` }}
                title={`True rate A = ${trueRateA}`}
              />
            </div>
            <div className="posterior-value">{(current?.muA ?? 0.5).toFixed(2)}</div>
          </div>
          <div className="posterior-item">
            <div className="posterior-label">Belief B</div>
            <div className="posterior-bar-track">
              <div
                className="posterior-bar-fill bar-b"
                style={{ width: `${(current?.muB ?? 0.5) * 100}%` }}
              />
              <div
                className="true-marker"
                style={{ left: `${trueRateB * 100}%` }}
                title={`True rate B = ${trueRateB}`}
              />
            </div>
            <div className="posterior-value">{(current?.muB ?? 0.5).toFixed(2)}</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="score-row">
          <div className="score-item">
            <span className="score-label">Score A</span>
            <span className="score-value">{livePolicy.scoreA.toFixed(3)}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Score B</span>
            <span className="score-value">{livePolicy.scoreB.toFixed(3)}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Log Bayes factor</span>
            <span className={`score-value ${(current?.lambda ?? 0) > 0.5 ? "pos" : (current?.lambda ?? 0) < -0.5 ? "neg" : ""}`}>
              {(current?.lambda ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stopping rule */}
        <div className="stopping-row">
          <div className="stopping-header">
            <span>Stopping rule</span>
            <div className="delta-control">
              <InlineMath math="\delta" /> = {delta.toFixed(2)}
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="stopping-bars">
            <div className="stopping-item">
              <span className="stopping-label"><InlineMath math="P(\theta_A > \theta_B)" /></span>
              <div className="stopping-bar-track">
                <div
                  className="stopping-bar-fill"
                  style={{ width: `${(current?.pABest ?? 0.5) * 100}%` }}
                />
                <div
                  className="stopping-threshold"
                  style={{ left: `${(1 - delta) * 100}%` }}
                  title={`Threshold: ${(1 - delta).toFixed(2)}`}
                />
              </div>
              <span className={`stopping-value ${(current?.pABest ?? 0) > 1 - delta ? "stopped" : ""}`}>
                {((current?.pABest ?? 0.5) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="stopping-item">
              <span className="stopping-label"><InlineMath math="P(\theta_B > \theta_A)" /></span>
              <div className="stopping-bar-track">
                <div
                  className="stopping-bar-fill bar-b"
                  style={{ width: `${(current?.pBBest ?? 0.5) * 100}%` }}
                />
                <div
                  className="stopping-threshold"
                  style={{ left: `${(1 - delta) * 100}%` }}
                  title={`Threshold: ${(1 - delta).toFixed(2)}`}
                />
              </div>
              <span className={`stopping-value ${(current?.pBBest ?? 0) > 1 - delta ? "stopped" : ""}`}>
                {((current?.pBBest ?? 0.5) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          {(current?.pABest ?? 0) > 1 - delta || (current?.pBBest ?? 0) > 1 - delta ? (
            <div className="stopping-verdict">
              ✓ Stop: {(current?.pABest ?? 0) > 1 - delta ? "A" : "B"} is best with probability &gt; {((1 - delta) * 100).toFixed(0)}%
            </div>
          ) : null}
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "var(--fg)" }} />
            Belief (posterior mean)
          </div>
          <div className="legend-item">
            <span className="legend-line" />
            True rate
          </div>
        </div>
      </div>

      <style jsx>{`
        .demo {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-4);
          overflow: hidden;
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 16px;
          background: var(--fg);
          color: var(--bg);
        }

        .demo-body {
          padding: 20px;
        }

        .params-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .params-left {
          display: flex;
          gap: 16px;
        }

        .params-right {
          display: flex;
          gap: 20px;
        }

        .param-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-group.slider-group {
          min-width: 140px;
        }

        .param-label {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .param-label :global(.katex) {
          font-size: 1em;
        }

        .param-group input[type="number"] {
          width: 72px;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
        }

        .param-group input[type="range"] {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .param-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
        }

        .controls-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--fg);
          border-radius: 4px;
          background: var(--fg);
          color: var(--bg);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .control-btn:hover {
          opacity: 0.85;
        }

        .control-btn.secondary {
          background: var(--bg);
          color: var(--fg);
          border-color: var(--border);
        }

        .control-btn.secondary:hover {
          border-color: var(--fg);
        }

        .step-display {
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
          color: var(--muted);
          margin-left: auto;
        }

        .viz-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .policy-panel,
        .trajectory-panel {
          background: color-mix(in srgb, var(--fg) 2%, transparent);
          border-radius: 6px;
          padding: 16px;
        }

        .panel-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .panel-title :global(.katex) {
          font-size: 1em;
        }

        .policy-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .policy-bar-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bar-label {
          font-size: 14px;
          font-weight: 600;
          width: 20px;
        }

        .bar-track {
          flex: 1;
          height: 24px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--fg);
          transition: width 0.15s ease;
        }

        .bar-fill.bar-b {
          background: #6b7280;
        }

        .bar-value {
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
          width: 40px;
          text-align: right;
        }

        .trajectory-svg {
          width: 100%;
          height: auto;
        }

        .posteriors-row {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .posterior-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .posterior-label {
          font-size: 12px;
          width: 50px;
        }

        .posterior-bar-track {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          position: relative;
          overflow: visible;
        }

        .posterior-bar-fill {
          height: 100%;
          background: var(--fg);
          border-radius: 4px;
          transition: width 0.15s ease;
        }

        .posterior-bar-fill.bar-b {
          background: #6b7280;
        }

        .true-marker {
          position: absolute;
          top: -4px;
          width: 2px;
          height: 16px;
          background: #22c55e;
          transform: translateX(-50%);
        }

        .posterior-value {
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
          width: 40px;
        }

        .score-row {
          display: flex;
          gap: 24px;
          padding: 12px 16px;
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .score-label {
          font-size: 11px;
          color: var(--muted);
        }

        .score-value {
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-geist-mono), monospace;
        }

        .score-value.pos {
          color: #22c55e;
        }

        .score-value.neg {
          color: #ef4444;
        }

        .legend {
          display: flex;
          gap: 20px;
          font-size: 11px;
          color: var(--muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-line {
          width: 16px;
          height: 2px;
          background: #22c55e;
        }

        .stopping-row {
          margin-top: 16px;
          padding: 16px;
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .stopping-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .delta-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          font-size: 11px;
          color: var(--muted);
        }

        .delta-control :global(.katex) {
          font-size: 1em;
        }

        .delta-control input[type="range"] {
          width: 80px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .delta-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
        }

        .stopping-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stopping-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stopping-label {
          font-size: 11px;
          width: 90px;
          color: var(--muted);
        }

        .stopping-label :global(.katex) {
          font-size: 1em;
        }

        .stopping-bar-track {
          flex: 1;
          height: 12px;
          background: var(--border);
          border-radius: 4px;
          position: relative;
          overflow: visible;
        }

        .stopping-bar-fill {
          height: 100%;
          background: var(--fg);
          border-radius: 4px;
          transition: width 0.15s ease;
        }

        .stopping-bar-fill.bar-b {
          background: #6b7280;
        }

        .stopping-threshold {
          position: absolute;
          top: -2px;
          width: 2px;
          height: 16px;
          background: #f59e0b;
          transform: translateX(-50%);
        }

        .stopping-value {
          font-size: 12px;
          font-family: var(--font-geist-mono), monospace;
          width: 40px;
        }

        .stopping-value.stopped {
          color: #22c55e;
          font-weight: 600;
        }

        .stopping-verdict {
          margin-top: 12px;
          padding: 8px 12px;
          background: color-mix(in srgb, #22c55e 15%, transparent);
          border: 1px solid #22c55e;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #22c55e;
        }

        @media (max-width: 640px) {
          .viz-grid {
            grid-template-columns: 1fr;
          }

          .params-row {
            gap: 12px;
          }

          .posteriors-row {
            flex-direction: column;
            gap: 12px;
          }

          .score-row {
            flex-wrap: wrap;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

