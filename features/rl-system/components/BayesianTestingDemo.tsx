"use client";

import { useState, useMemo, useCallback } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

type RewardType = "binary" | "continuous";

// Seeded random number generator for reproducibility
function seededRandom(seed: number) {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export function BayesianTestingDemo() {
  const [rewardType, setRewardType] = useState<RewardType>("binary");

  // Binary parameters
  const [binaryTrueRateA, setBinaryTrueRateA] = useState(0.55);
  const [binaryTrueRateB, setBinaryTrueRateB] = useState(0.48);
  const [binaryPriorAlpha, setBinaryPriorAlpha] = useState(1);
  const [binaryPriorBeta, setBinaryPriorBeta] = useState(1);
  const [binaryTotalPulls, setBinaryTotalPulls] = useState(200);

  // Continuous parameters
  const [contTrueMeanA, setContTrueMeanA] = useState(0.25);
  const [contTrueMeanB, setContTrueMeanB] = useState(-0.1);
  const [contNoiseStd, setContNoiseStd] = useState(1);
  const [contTotalPulls, setContTotalPulls] = useState(200);

  // Sequential testing state
  const [simulationSeed, setSimulationSeed] = useState(42);
  const [upperBoundary, setUpperBoundary] = useState(2.94); // log(19) ≈ 2.94 for ~5% error
  const [lowerBoundary, setLowerBoundary] = useState(-2.94);

  // Simulate sequential observations and compute log Bayes factor trajectory
  const sequentialData = useMemo(() => {
    const rng = seededRandom(simulationSeed);
    
    if (rewardType === "binary") {
      const totalPulls = binaryTotalPulls;
      const observations: { arm: "A" | "B"; reward: 0 | 1; logBF: number; t: number }[] = [];
      
      let pullsA = 0, pullsB = 0;
      let successesA = 0, successesB = 0;
      let logBF = 0;
      
      const alpha0 = binaryPriorAlpha;
      const beta0 = binaryPriorBeta;
      
      for (let t = 0; t < totalPulls; t++) {
        // Alternate between arms (50/50 allocation)
        const selectA = rng() < 0.5;
        
        if (selectA) {
          const reward = rng() < binaryTrueRateA ? 1 : 0;
          if (reward === 1) successesA++;
          pullsA++;
          
          // Compute evidence increment
          // H1: arms have different rates (use arm-specific posterior predictive)
          // H0: arms have same rate (use pooled posterior predictive)
          const alphaA = alpha0 + successesA - reward;
          const betaA = beta0 + pullsA - 1 - (successesA - reward);
          const predH1 = (alphaA + reward) / (alphaA + betaA + 1);
          
          const pooledSucc = successesA + successesB - reward;
          const pooledN = pullsA + pullsB - 1;
          const alphaPooled = alpha0 + pooledSucc;
          const betaPooled = beta0 + pooledN - pooledSucc;
          const predH0 = (alphaPooled + reward) / (alphaPooled + betaPooled + 1);
          
          const delta = reward === 1 
            ? Math.log(Math.max(0.001, predH1) / Math.max(0.001, predH0))
            : Math.log(Math.max(0.001, 1 - predH1) / Math.max(0.001, 1 - predH0));
          
          logBF += isFinite(delta) ? delta : 0;
          observations.push({ arm: "A", reward: reward as 0 | 1, logBF, t: t + 1 });
        } else {
          const reward = rng() < binaryTrueRateB ? 1 : 0;
          if (reward === 1) successesB++;
          pullsB++;
          
          const alphaB = alpha0 + successesB - reward;
          const betaB = beta0 + pullsB - 1 - (successesB - reward);
          const predH1 = (alphaB + reward) / (alphaB + betaB + 1);
          
          const pooledSucc = successesA + successesB - reward;
          const pooledN = pullsA + pullsB - 1;
          const alphaPooled = alpha0 + pooledSucc;
          const betaPooled = beta0 + pooledN - pooledSucc;
          const predH0 = (alphaPooled + reward) / (alphaPooled + betaPooled + 1);
          
          const delta = reward === 1 
            ? Math.log(Math.max(0.001, predH1) / Math.max(0.001, predH0))
            : Math.log(Math.max(0.001, 1 - predH1) / Math.max(0.001, 1 - predH0));
          
          logBF += isFinite(delta) ? delta : 0;
          observations.push({ arm: "B", reward: reward as 0 | 1, logBF, t: t + 1 });
        }
      }
      
      return observations;
    } else {
      // Continuous case
      const totalPulls = contTotalPulls;
      const observations: { arm: "A" | "B"; reward: number; logBF: number; t: number }[] = [];
      
      // Box-Muller transform for normal samples
      const normalSample = (mean: number, std: number) => {
        const u1 = rng();
        const u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z;
      };
      
      let pullsA = 0, pullsB = 0;
      let sumA = 0, sumB = 0;
      let logBF = 0;
      
      for (let t = 0; t < totalPulls; t++) {
        const selectA = rng() < 0.5;
        
        if (selectA) {
          const reward = normalSample(contTrueMeanA, contNoiseStd);
          sumA += reward;
          pullsA++;
          
          // Evidence based on deviation from pooled mean
          const meanA = pullsA > 0 ? sumA / pullsA : 0;
          const pooledMean = (pullsA + pullsB) > 0 ? (sumA + sumB) / (pullsA + pullsB) : 0;
          const delta = (reward - pooledMean) * (meanA - pooledMean) / (contNoiseStd * contNoiseStd);
          
          logBF += isFinite(delta) ? delta * 0.3 : 0;
          observations.push({ arm: "A", reward, logBF, t: t + 1 });
        } else {
          const reward = normalSample(contTrueMeanB, contNoiseStd);
          sumB += reward;
          pullsB++;
          
          const meanB = pullsB > 0 ? sumB / pullsB : 0;
          const pooledMean = (pullsA + pullsB) > 0 ? (sumA + sumB) / (pullsA + pullsB) : 0;
          const delta = (reward - pooledMean) * (meanB - pooledMean) / (contNoiseStd * contNoiseStd);
          
          logBF += isFinite(delta) ? delta * 0.3 : 0;
          observations.push({ arm: "B", reward, logBF, t: t + 1 });
        }
      }
      
      return observations;
    }
  }, [rewardType, binaryTrueRateA, binaryTrueRateB, binaryPriorAlpha, binaryPriorBeta, binaryTotalPulls, contTrueMeanA, contTrueMeanB, contNoiseStd, contTotalPulls, simulationSeed]);

  // Find first boundary crossing
  const boundaryStatus = useMemo(() => {
    for (const obs of sequentialData) {
      if (obs.logBF >= upperBoundary) {
        return { crossed: "upper" as const, t: obs.t, logBF: obs.logBF };
      }
      if (obs.logBF <= lowerBoundary) {
        return { crossed: "lower" as const, t: obs.t, logBF: obs.logBF };
      }
    }
    return { crossed: null, t: sequentialData.length, logBF: sequentialData[sequentialData.length - 1]?.logBF ?? 0 };
  }, [sequentialData, upperBoundary, lowerBoundary]);

  const resimulate = useCallback(() => {
    setSimulationSeed(prev => prev + 1);
  }, []);

  // Scale for trajectory chart
  const yScale = Math.max(Math.abs(upperBoundary), Math.abs(lowerBoundary)) * 1.3;

  return (
    <div className="demo">
      <div className="demo-header">
        <FlaskConical size={18} />
        <span>Sequential Bayesian Testing</span>
      </div>

      <div className="tabs">
        <button
          className={`tab ${rewardType === "binary" ? "active" : ""}`}
          onClick={() => setRewardType("binary")}
        >
          Binary Reward
        </button>
        <button
          className={`tab ${rewardType === "continuous" ? "active" : ""}`}
          onClick={() => setRewardType("continuous")}
        >
          Continuous Reward
        </button>
      </div>

      <div className="demo-body">
        {/* Parameters Section */}
        <div className="params-grid">
          {rewardType === "binary" ? (
            <>
              <div className="param-group">
                <div className="param-label">True rate <InlineMath math="Q(A)" /></div>
                <input
                  type="number"
                  value={binaryTrueRateA}
                  onChange={(e) => setBinaryTrueRateA(Math.max(0, Math.min(1, Number(e.target.value))))}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
              <div className="param-group">
                <div className="param-label">True rate <InlineMath math="Q(B)" /></div>
                <input
                  type="number"
                  value={binaryTrueRateB}
                  onChange={(e) => setBinaryTrueRateB(Math.max(0, Math.min(1, Number(e.target.value))))}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
              <div className="param-group">
                <div className="param-label">Prior <InlineMath math="\alpha" /></div>
                <input
                  type="number"
                  value={binaryPriorAlpha}
                  onChange={(e) => setBinaryPriorAlpha(Math.max(0.1, Number(e.target.value)))}
                  min="0.1"
                  step="0.5"
                />
              </div>
              <div className="param-group">
                <div className="param-label">Prior <InlineMath math="\beta" /></div>
                <input
                  type="number"
                  value={binaryPriorBeta}
                  onChange={(e) => setBinaryPriorBeta(Math.max(0.1, Number(e.target.value)))}
                  min="0.1"
                  step="0.5"
                />
              </div>
              <div className="param-group">
                <div className="param-label">Max pulls <InlineMath math="T" /></div>
                <input
                  type="number"
                  value={binaryTotalPulls}
                  onChange={(e) => setBinaryTotalPulls(Math.max(10, Math.floor(Number(e.target.value))))}
                  min="10"
                  step="50"
                />
              </div>
            </>
          ) : (
            <>
              <div className="param-group">
                <div className="param-label">True mean <InlineMath math="Q(A)" /></div>
                <input
                  type="number"
                  value={contTrueMeanA}
                  onChange={(e) => setContTrueMeanA(Number(e.target.value))}
                  step="0.1"
                />
              </div>
              <div className="param-group">
                <div className="param-label">True mean <InlineMath math="Q(B)" /></div>
                <input
                  type="number"
                  value={contTrueMeanB}
                  onChange={(e) => setContTrueMeanB(Number(e.target.value))}
                  step="0.1"
                />
              </div>
              <div className="param-group">
                <div className="param-label">Noise <InlineMath math="\sigma" /></div>
                <input
                  type="number"
                  value={contNoiseStd}
                  onChange={(e) => setContNoiseStd(Math.max(0.01, Number(e.target.value)))}
                  min="0.01"
                  step="0.1"
                />
              </div>
              <div className="param-group">
                <div className="param-label">Max pulls <InlineMath math="T" /></div>
                <input
                  type="number"
                  value={contTotalPulls}
                  onChange={(e) => setContTotalPulls(Math.max(10, Math.floor(Number(e.target.value))))}
                  min="10"
                  step="50"
                />
              </div>
            </>
          )}
          <div className="param-group">
            <div className="param-label">Boundary <InlineMath math="\pm" /></div>
            <input
              type="number"
              value={upperBoundary}
              onChange={(e) => {
                const val = Math.max(0.1, Number(e.target.value));
                setUpperBoundary(val);
                setLowerBoundary(-val);
              }}
              min="0.1"
              step="0.1"
            />
          </div>
        </div>

        <div className="action-row">
          <button className="resim-btn" onClick={resimulate}>
            <RotateCcw size={14} />
            Resimulate
          </button>
        </div>

        {/* Trajectory Chart */}
        <div className="trajectory-chart">
          <svg viewBox="0 0 560 200" className="chart">
            {/* Upper boundary region */}
            <rect 
              x="0" 
              y="0" 
              width="560" 
              height={100 - (upperBoundary / yScale) * 100}
              fill="#22c55e"
              opacity="0.08"
            />
            
            {/* Lower boundary region */}
            <rect 
              x="0" 
              y={100 + (Math.abs(lowerBoundary) / yScale) * 100}
              width="560" 
              height={100 - (Math.abs(lowerBoundary) / yScale) * 100}
              fill="#ef4444"
              opacity="0.08"
            />
            
            {/* Zero line */}
            <line x1="0" y1="100" x2="560" y2="100" stroke="var(--border)" strokeWidth="1" />
            
            {/* Upper boundary */}
            <line 
              x1="0" 
              y1={100 - (upperBoundary / yScale) * 100}
              x2="560" 
              y2={100 - (upperBoundary / yScale) * 100}
              stroke="#22c55e" 
              strokeWidth="2" 
              strokeDasharray="6 4"
            />
            
            {/* Lower boundary */}
            <line 
              x1="0" 
              y1={100 + (Math.abs(lowerBoundary) / yScale) * 100}
              x2="560" 
              y2={100 + (Math.abs(lowerBoundary) / yScale) * 100}
              stroke="#ef4444" 
              strokeWidth="2" 
              strokeDasharray="6 4"
            />
            
            {/* Log Bayes factor trajectory */}
            {sequentialData.length > 0 && (
              <path
                d={`M 0,100 ${sequentialData.map((d) => {
                  const x = (d.t / sequentialData.length) * 560;
                  const y = 100 - (d.logBF / yScale) * 100;
                  return `L ${x},${Math.max(5, Math.min(195, y))}`;
                }).join(" ")}`}
                fill="none"
                stroke="var(--fg)"
                strokeWidth="1.5"
              />
            )}
            
            {/* Current position marker */}
            {sequentialData.length > 0 && (
              <circle
                cx={(boundaryStatus.t / sequentialData.length) * 560}
                cy={Math.max(5, Math.min(195, 100 - (boundaryStatus.logBF / yScale) * 100))}
                r="5"
                fill={boundaryStatus.crossed === "upper" ? "#22c55e" : boundaryStatus.crossed === "lower" ? "#ef4444" : "var(--fg)"}
              />
            )}
            
            {/* Boundary labels */}
            <text x="4" y={100 - (upperBoundary / yScale) * 100 - 6} fill="#22c55e" fontSize="10" fontFamily="var(--font-geist-mono)">
              +{upperBoundary.toFixed(2)}
            </text>
            <text x="4" y={100 + (Math.abs(lowerBoundary) / yScale) * 100 + 14} fill="#ef4444" fontSize="10" fontFamily="var(--font-geist-mono)">
              {lowerBoundary.toFixed(2)}
            </text>
            <text x="540" y="96" fill="var(--muted)" fontSize="10" fontFamily="var(--font-geist-mono)" textAnchor="end">
              0
            </text>
          </svg>
          
          <div className="trajectory-axis">
            <span>0</span>
            <span>Observation <InlineMath math="t" /></span>
            <span>{sequentialData.length}</span>
          </div>
        </div>

        {/* Results */}
        <div className="results">
          <div className="result-item">
            <span className="result-label">Log Bayes factor <InlineMath math="\ell_t" /></span>
            <span className="result-value">{boundaryStatus.logBF.toFixed(2)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Decision</span>
            <span className={`result-value ${boundaryStatus.crossed === "upper" ? "strong-a" : boundaryStatus.crossed === "lower" ? "strong-b" : "inconclusive"}`}>
              {boundaryStatus.crossed === "upper" 
                ? `Stop at t=${boundaryStatus.t}: A wins` 
                : boundaryStatus.crossed === "lower" 
                ? `Stop at t=${boundaryStatus.t}: B wins`
                : "Continue testing"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <span className="legend-line" style={{ background: "#22c55e" }} />
            <span>Upper boundary (A &gt; B)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line" style={{ background: "#ef4444" }} />
            <span>Lower boundary (B &gt; A)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line" style={{ background: "var(--fg)" }} />
            <span><InlineMath math="\ell_t" /> trajectory</span>
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

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }

        .tab {
          flex: 1;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.15s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }

        .tab:hover {
          color: var(--fg);
          background: color-mix(in srgb, var(--fg) 3%, transparent);
        }

        .tab.active {
          color: var(--fg);
          border-bottom-color: var(--fg);
        }

        .demo-body {
          padding: 20px;
        }

        .params-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }

        .param-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-label {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .param-group input {
          width: 70px;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 13px;
          font-family: var(--font-geist-mono), monospace;
        }

        .param-group input:focus {
          outline: none;
          border-color: var(--fg);
        }

        .action-row {
          margin-bottom: 16px;
        }

        .resim-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .resim-btn:hover {
          border-color: var(--fg);
          background: color-mix(in srgb, var(--fg) 5%, transparent);
        }

        .trajectory-chart {
          background: color-mix(in srgb, var(--fg) 2%, transparent);
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .chart {
          width: 100%;
          height: auto;
        }

        .trajectory-axis {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
          margin-top: 8px;
        }

        .results {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .result-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .result-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .result-value {
          font-size: 16px;
          font-weight: 600;
          font-family: var(--font-geist-mono), monospace;
        }

        .result-value.strong-a {
          color: #22c55e;
        }

        .result-value.strong-b {
          color: #ef4444;
        }

        .result-value.inconclusive {
          color: var(--muted);
        }

        .legend {
          display: flex;
          gap: 20px;
          font-size: 11px;
          color: var(--muted);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-line {
          width: 16px;
          height: 3px;
          border-radius: 2px;
        }

        @media (max-width: 640px) {
          .params-grid {
            gap: 8px;
          }
          
          .param-group input {
            width: 60px;
          }
          
          .results {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
