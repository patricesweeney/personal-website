"use client";

import { useState, useMemo, useRef } from "react";
import { Lock, Unlock, Building2, Users, FlaskConical, Presentation } from "lucide-react";

interface CompanyState {
  researchQuality: number; // 0-100
  meetingQuality: number; // 0-100
}

export function CausalMediationDemo() {
  const [companyA, setCompanyA] = useState<CompanyState>({
    researchQuality: 80,
    meetingQuality: 75,
  });
  const [companyB, setCompanyB] = useState<CompanyState>({
    researchQuality: 30,
    meetingQuality: 25,
  });
  const [lockActions, setLockActions] = useState(false);
  const lockedScoreRef = useRef<number>(53); // Store the locked score

  // Derive action quality from internal work (only when not locked)
  const computeActionScore = (state: CompanyState) => {
    return Math.round((state.researchQuality * 0.6 + state.meetingQuality * 0.4));
  };

  // When toggling lock, capture the current average score
  const handleLockToggle = () => {
    if (!lockActions) {
      // Locking: capture the average score now
      const avgScore = Math.round((computeActionScore(companyA) + computeActionScore(companyB)) / 2);
      lockedScoreRef.current = avgScore;
    }
    setLockActions(!lockActions);
  };

  // Get action score: locked or computed from internal work
  const getActionScoreForCompany = (state: CompanyState) => {
    return lockActions ? lockedScoreRef.current : computeActionScore(state);
  };

  // Revenue is purely a function of action score
  const computeRevenue = (actionScore: number) => {
    const baseRevenue = 500000;
    const multiplier = 0.5 + (actionScore / 100) * 1.5; // 0.5x to 2x
    return Math.round(baseRevenue * multiplier);
  };

  const actionScoreA = getActionScoreForCompany(companyA);
  const actionScoreB = getActionScoreForCompany(companyB);
  const revenueA = computeRevenue(actionScoreA);
  const revenueB = computeRevenue(actionScoreB);

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#84cc16";
    if (score >= 40) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="demo">
      <div className="demo-header">
        <Building2 size={18} />
        <span>Causal Mediation Demo</span>
      </div>

      <div className="demo-body">
        <div className="explanation">
          <p>
            Two companies with different internal operations. Adjust their research and meeting quality, 
            then toggle <strong>"Hold actions constant"</strong> to see what happens.
          </p>
        </div>

        <div className="lock-control">
          <button 
            className={`lock-btn ${lockActions ? "locked" : ""}`}
            onClick={handleLockToggle}
          >
            {lockActions ? <Lock size={16} /> : <Unlock size={16} />}
            {lockActions ? "Actions held constant" : "Hold actions constant"}
          </button>
          {lockActions && (
            <span className="lock-hint">
              Both companies now take identical actions (score: {lockedScoreRef.current})
            </span>
          )}
        </div>

        <div className="companies">
          <CompanyCard
            name="Company A"
            state={companyA}
            setState={setCompanyA}
            actionScore={actionScoreA}
            revenue={revenueA}
            formatCurrency={formatCurrency}
            getQualityLabel={getQualityLabel}
            getQualityColor={getQualityColor}
            locked={lockActions}
          />
          <CompanyCard
            name="Company B"
            state={companyB}
            setState={setCompanyB}
            actionScore={actionScoreB}
            revenue={revenueB}
            formatCurrency={formatCurrency}
            getQualityLabel={getQualityLabel}
            getQualityColor={getQualityColor}
            locked={lockActions}
          />
        </div>

        <div className={`insight ${lockActions ? "visible" : ""}`}>
          <div className="insight-content">
            {lockActions ? (
              revenueA === revenueB ? (
                <>
                  <span className="insight-icon">✓</span>
                  <span>
                    <strong>Same revenue.</strong> Despite vastly different internal work, 
                    the companies earn identical revenue because their actions are identical.
                    <br />
                    <em>R ⊥⊥ X | A</em> — revenue is independent of internal work given actions.
                  </span>
                </>
              ) : (
                <>
                  <span className="insight-icon">≈</span>
                  <span>
                    Revenue depends only on actions. Try adjusting sliders—notice revenue doesn't change 
                    while actions are locked.
                  </span>
                </>
              )
            ) : (
              <>
                <span className="insight-icon">↔</span>
                <span>
                  Revenue differs because internal work drives different actions. 
                  Lock actions to isolate the effect.
                </span>
              </>
            )}
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

        .explanation {
          margin-bottom: 16px;
        }

        .explanation p {
          font-size: 14px;
          color: var(--muted);
          margin: 0;
        }

        .lock-control {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .lock-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          border: 2px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lock-btn:hover {
          border-color: var(--fg);
        }

        .lock-btn.locked {
          background: var(--fg);
          color: var(--bg);
          border-color: var(--fg);
        }

        .lock-hint {
          font-size: 12px;
          color: var(--muted);
          font-style: italic;
        }

        .companies {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .companies {
            grid-template-columns: 1fr;
          }
        }

        .insight {
          margin-top: 20px;
          padding: 16px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--fg) 4%, transparent);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .insight.visible {
          background: color-mix(in srgb, #22c55e 10%, transparent);
          border-color: #22c55e;
        }

        .insight-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .insight-icon {
          font-size: 18px;
          flex-shrink: 0;
          width: 24px;
          text-align: center;
        }

        .insight em {
          font-family: var(--font-geist-mono), monospace;
          font-size: 12px;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

interface CompanyCardProps {
  name: string;
  state: CompanyState;
  setState: (state: CompanyState) => void;
  actionScore: number;
  revenue: number;
  formatCurrency: (value: number) => string;
  getQualityLabel: (score: number) => string;
  getQualityColor: (score: number) => string;
  locked: boolean;
}

function CompanyCard({
  name,
  state,
  setState,
  actionScore,
  revenue,
  formatCurrency,
  getQualityLabel,
  getQualityColor,
  locked,
}: CompanyCardProps) {
  return (
    <div className="company-card">
      <div className="company-header">{name}</div>

      <div className="internal-section">
        <div className="section-label">
          <span>Internal Work</span>
          <span className="x-label">X</span>
        </div>

        <div className="slider-row">
          <div className="slider-label">
            <FlaskConical size={14} />
            <span>Research</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={state.researchQuality}
            onChange={(e) =>
              setState({ ...state, researchQuality: Number(e.target.value) })
            }
          />
          <span
            className="slider-value"
            style={{ color: getQualityColor(state.researchQuality) }}
          >
            {getQualityLabel(state.researchQuality)}
          </span>
        </div>

        <div className="slider-row">
          <div className="slider-label">
            <Presentation size={14} />
            <span>Meetings</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={state.meetingQuality}
            onChange={(e) =>
              setState({ ...state, meetingQuality: Number(e.target.value) })
            }
          />
          <span
            className="slider-value"
            style={{ color: getQualityColor(state.meetingQuality) }}
          >
            {getQualityLabel(state.meetingQuality)}
          </span>
        </div>
      </div>

      <div className="arrow-down">↓</div>

      <div className={`action-section ${locked ? "locked" : ""}`}>
        <div className="section-label">
          <span>Actions Taken</span>
          <span className="a-label">A</span>
          {locked && <Lock size={12} className="lock-icon" />}
        </div>
        <div className="action-score">
          <Users size={16} />
          <span>Quality Score</span>
          <span className="score-value" style={{ color: getQualityColor(actionScore) }}>
            {actionScore}
          </span>
        </div>
      </div>

      <div className="arrow-down">↓</div>

      <div className="revenue-section">
        <div className="section-label">
          <span>Revenue</span>
          <span className="r-label">R</span>
        </div>
        <div className="revenue-value">{formatCurrency(revenue)}</div>
      </div>

      <style jsx>{`
        .company-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .company-header {
          font-weight: 600;
          font-size: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .x-label,
        .a-label,
        .r-label {
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 3px;
          font-weight: 700;
        }

        .x-label {
          background: color-mix(in srgb, #8b5cf6 20%, transparent);
          color: #8b5cf6;
        }

        .a-label {
          background: color-mix(in srgb, #3b82f6 20%, transparent);
          color: #3b82f6;
        }

        .r-label {
          background: color-mix(in srgb, #22c55e 20%, transparent);
          color: #22c55e;
        }

        .internal-section {
          padding: 12px;
          background: color-mix(in srgb, #8b5cf6 5%, transparent);
          border-radius: 6px;
        }

        .slider-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .slider-row:last-child {
          margin-bottom: 0;
        }

        .slider-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          width: 80px;
          flex-shrink: 0;
        }

        .slider-row input[type="range"] {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 2px;
          cursor: pointer;
        }

        .slider-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
        }

        .slider-value {
          font-size: 11px;
          font-weight: 600;
          width: 60px;
          text-align: right;
        }

        .arrow-down {
          text-align: center;
          color: var(--muted);
          font-size: 16px;
          line-height: 1;
        }

        .action-section {
          padding: 12px;
          background: color-mix(in srgb, #3b82f6 5%, transparent);
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .action-section.locked {
          background: color-mix(in srgb, #3b82f6 12%, transparent);
          border: 1px dashed #3b82f6;
        }

        .action-score {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .score-value {
          margin-left: auto;
          font-weight: 700;
          font-family: var(--font-geist-mono), monospace;
          font-size: 18px;
        }

        .revenue-section {
          padding: 12px;
          background: color-mix(in srgb, #22c55e 5%, transparent);
          border-radius: 6px;
        }

        .revenue-value {
          font-size: 24px;
          font-weight: 700;
          font-family: var(--font-geist-mono), monospace;
          color: #16a34a;
        }
      `}</style>
    </div>
  );
}

