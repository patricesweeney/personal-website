"use client";

import { useState, useMemo } from "react";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { Calculator, TrendingUp, DollarSign, Clock, RotateCcw } from "lucide-react";

// Format number with commas for display
const formatWithCommas = (value: number): string => {
  return value.toLocaleString("en-US");
};

// Parse number from string with commas
const parseFromCommas = (value: string): number => {
  return Number(value.replace(/,/g, "")) || 0;
};

type MetricAffected = "churn" | "nrr" | "conversion" | "arpa" | "arpa_growth";

interface ActionOption {
  category: string;
  subcategory: string;
  label: string;
  defaultMetric: MetricAffected;
  defaultLift: number; // percentage
  benchmarkRange: [number, number]; // [low, high] percentage
}

const actionOptions: ActionOption[] = [
  // Product - Features
  { category: "Product", subcategory: "Features", label: "Build new features", defaultMetric: "churn", defaultLift: -10, benchmarkRange: [-20, -5] },
  { category: "Product", subcategory: "Features", label: "Remove / simplify", defaultMetric: "conversion", defaultLift: 8, benchmarkRange: [3, 15] },
  { category: "Product", subcategory: "Features", label: "Recompose defaults", defaultMetric: "conversion", defaultLift: 10, benchmarkRange: [5, 20] },
  // Product - UX
  { category: "Product", subcategory: "User experience", label: "Improve onboarding", defaultMetric: "churn", defaultLift: -15, benchmarkRange: [-25, -8] },
  { category: "Product", subcategory: "User experience", label: "Fix information architecture", defaultMetric: "churn", defaultLift: -8, benchmarkRange: [-15, -3] },
  { category: "Product", subcategory: "User experience", label: "Simplify core flows", defaultMetric: "conversion", defaultLift: 12, benchmarkRange: [5, 20] },
  // Product - Reliability
  { category: "Product", subcategory: "Reliability", label: "Improve availability", defaultMetric: "churn", defaultLift: -5, benchmarkRange: [-12, -2] },
  { category: "Product", subcategory: "Reliability", label: "Improve correctness", defaultMetric: "churn", defaultLift: -8, benchmarkRange: [-15, -3] },
  // Pricing
  { category: "Pricing", subcategory: "Price level", label: "Increase price level", defaultMetric: "arpa", defaultLift: 10, benchmarkRange: [5, 20] },
  { category: "Pricing", subcategory: "Price level", label: "Decrease price level", defaultMetric: "conversion", defaultLift: 10, benchmarkRange: [5, 20] },
  { category: "Pricing", subcategory: "Package structure", label: "Add GBB constraint", defaultMetric: "arpa", defaultLift: 12, benchmarkRange: [5, 25] },
  { category: "Pricing", subcategory: "Product configuration", label: "Move feature up/down", defaultMetric: "arpa", defaultLift: 8, benchmarkRange: [3, 15] },
  { category: "Pricing", subcategory: "Freemium strategy", label: "Add/remove free trial", defaultMetric: "conversion", defaultLift: 20, benchmarkRange: [10, 35] },
  { category: "Pricing", subcategory: "Price model", label: "Add usage-based pricing", defaultMetric: "arpa_growth", defaultLift: 15, benchmarkRange: [8, 25] },
  // Promotion
  { category: "Promotion", subcategory: "Performance marketing", label: "Improve copy", defaultMetric: "conversion", defaultLift: 15, benchmarkRange: [8, 30] },
  { category: "Promotion", subcategory: "Performance marketing", label: "Change targeting", defaultMetric: "conversion", defaultLift: 12, benchmarkRange: [5, 25] },
  { category: "Promotion", subcategory: "Pre-sale lifecycle", label: "Send lead nurture", defaultMetric: "conversion", defaultLift: 10, benchmarkRange: [5, 20] },
  { category: "Promotion", subcategory: "Post-sale lifecycle", label: "Send activation nudges", defaultMetric: "churn", defaultLift: -12, benchmarkRange: [-20, -5] },
  { category: "Promotion", subcategory: "Post-sale lifecycle", label: "Send expansion prompts", defaultMetric: "nrr", defaultLift: 5, benchmarkRange: [2, 10] },
  { category: "Promotion", subcategory: "Post-sale lifecycle", label: "Run retention motions", defaultMetric: "churn", defaultLift: -20, benchmarkRange: [-30, -10] },
  { category: "Promotion", subcategory: "Customer success", label: "Run business reviews", defaultMetric: "nrr", defaultLift: 4, benchmarkRange: [2, 8] },
];

const metricLabels: Record<MetricAffected, string> = {
  churn: "Monthly logo churn",
  nrr: "Annual NRR",
  conversion: "Customer growth",
  arpa: "Initial ARPA",
  arpa_growth: "ARPA growth",
};

export function ActionValueCalculator() {
  // Company baseline inputs
  const [arr, setArr] = useState(20000000);
  const [customerCount, setCustomerCount] = useState(3500);
  const [monthlyChurn, setMonthlyChurn] = useState(3);
  const [annualNrr, setAnnualNrr] = useState(110);
  const [monthlyCustomerGrowth, setMonthlyCustomerGrowth] = useState(1.5);
  const [monthlyArpaGrowth, setMonthlyArpaGrowth] = useState(0.5);
  const [fcfMargin, setFcfMargin] = useState(20);
  const [annualDiscount, setAnnualDiscount] = useState(15);

  // Action inputs
  const [selectedActionIdx, setSelectedActionIdx] = useState(3); // Default to onboarding
  const [liftPercent, setLiftPercent] = useState(actionOptions[3].defaultLift);
  const [implementationCost, setImplementationCost] = useState(25000);

  const selectedAction = actionOptions[selectedActionIdx];

  // When action changes, update lift to default
  const handleActionChange = (idx: number) => {
    setSelectedActionIdx(idx);
    setLiftPercent(actionOptions[idx].defaultLift);
  };

  // Calculations
  const results = useMemo(() => {
    const arpa = (arr / 12) / customerCount; // Monthly ARPA from ARR
    const monthlyDiscount = Math.pow(1 + annualDiscount / 100, 1 / 12) - 1;
    const retentionDecimal = 1 - (monthlyChurn / 100); // Convert churn to retention
    const nrrDecimal = Math.pow(annualNrr / 100, 1 / 12); // Convert annual NRR to monthly
    const customerGrowthDecimal = 1 + (monthlyCustomerGrowth / 100);
    const arpaGrowthDecimal = 1 + (monthlyArpaGrowth / 100);
    const arrGrowthDecimal = customerGrowthDecimal * arpaGrowthDecimal; // Combined ARR growth

    // Baseline CLV using geometric series approximation
    // CLV = ARPA / (1 + r - retention × NRR × arpaGrowth)
    // Existing customers benefit from: retention, NRR expansion, AND ARPA growth (price increases)
    const effectiveMultiplier = retentionDecimal * nrrDecimal * arpaGrowthDecimal;
    const clvMultiplier = effectiveMultiplier < (1 + monthlyDiscount) 
      ? 1 / (1 + monthlyDiscount - effectiveMultiplier)
      : 60; // Cap at 5 years if infinite series doesn't converge
    const baselineCLV = arpa * clvMultiplier;
    
    // Value from EXISTING customers (their remaining lifetime value)
    const existingCustomerValue = customerCount * baselineCLV;
    
    // Value from FUTURE acquisitions (PV of growing stream of new customers)
    // Acquisition rate at t=0 includes both growth and churn replacement
    const newCustomersPerMonth = customerCount * (monthlyCustomerGrowth / 100 + monthlyChurn / 100);
    
    // PV of future cohorts where:
    // - Acquisition rate grows at customerGrowth rate  
    // - CLV of each cohort grows at arpaGrowth rate (higher starting ARPA)
    // - Combined growth G = (1+g_c)(1+g_a)
    // Formula: N₀ × CLV × G / (R - G) where R = 1 + discount
    const maxMonths = 120; // 10-year cap
    const growthGap = 1 + monthlyDiscount - arrGrowthDecimal;
    const futureMultiplier = growthGap > 0 
      ? Math.min(arrGrowthDecimal / growthGap, maxMonths) 
      : maxMonths;
    const futureAcquisitionValue = newCustomersPerMonth * baselineCLV * futureMultiplier;
    
    // Total CE = existing customers + future acquisitions
    const baselineCE = existingCustomerValue + Math.max(0, futureAcquisitionValue);

    // Post-action metrics based on what the action affects
    let newChurn = monthlyChurn;
    let newNrrAnnual = annualNrr;
    let newArpa = arpa;
    let newCustomerGrowth = monthlyCustomerGrowth;
    let newArpaGrowth = monthlyArpaGrowth;

    switch (selectedAction.defaultMetric) {
      case "churn":
        // Lift is negative for churn reduction (e.g., -15% means churn goes from 3% to 2.55%)
        newChurn = monthlyChurn * (1 + liftPercent / 100);
        newChurn = Math.max(0.1, newChurn); // Floor at 0.1%
        break;
      case "nrr":
        // Direct lift to annual NRR (e.g., +5% means 110% → 115%)
        newNrrAnnual = annualNrr + liftPercent;
        break;
      case "conversion":
        // Lift to customer growth rate (e.g., +15% means 1.5% → 1.725%)
        newCustomerGrowth = monthlyCustomerGrowth * (1 + liftPercent / 100);
        break;
      case "arpa":
        // Direct lift to ARPA (e.g., +10% price increase)
        newArpa = arpa * (1 + liftPercent / 100);
        break;
      case "arpa_growth":
        // Lift to ARPA growth rate (e.g., +15% means 0.5% → 0.575%)
        newArpaGrowth = monthlyArpaGrowth * (1 + liftPercent / 100);
        break;
    }

    // Recalculate derived values with new metrics
    const newRetentionDecimal = 1 - (newChurn / 100);
    const newNrrDecimal = Math.pow(newNrrAnnual / 100, 1 / 12);
    const newCustomerGrowthDecimal = 1 + (newCustomerGrowth / 100);
    const newArpaGrowthDecimal = 1 + (newArpaGrowth / 100);
    const newArrGrowthDecimal = newCustomerGrowthDecimal * newArpaGrowthDecimal;

    // Post-action CLV (includes ARPA growth for existing customers)
    const newEffectiveMultiplier = newRetentionDecimal * newNrrDecimal * newArpaGrowthDecimal;
    const newClvMultiplier = newEffectiveMultiplier < (1 + monthlyDiscount)
      ? 1 / (1 + monthlyDiscount - newEffectiveMultiplier)
      : 60;
    
    const postActionCLV = newArpa * newClvMultiplier;
    
    // Post-action acquisition rate
    const postNewCustomersPerMonth = customerCount * (newCustomerGrowth / 100 + newChurn / 100);
    
    // Post-action: existing customers + future acquisitions
    const postExistingValue = customerCount * postActionCLV;
    const newGrowthGap = 1 + monthlyDiscount - newArrGrowthDecimal;
    const newFutureMultiplier = newGrowthGap > 0 
      ? Math.min(newArrGrowthDecimal / newGrowthGap, maxMonths) 
      : maxMonths;
    const postFutureValue = postNewCustomersPerMonth * postActionCLV * newFutureMultiplier;
    const postActionCE = postExistingValue + Math.max(0, postFutureValue);

    // Convert revenue to FCF
    const fcfMultiplier = fcfMargin / 100;
    const baselineFCF = baselineCE * fcfMultiplier;
    const postActionFCF = postActionCE * fcfMultiplier;
    
    // FCF advantage = incremental FCF - implementation cost
    const revenueAdvantage = postActionCE - baselineCE;
    const fcfAdvantage = (revenueAdvantage * fcfMultiplier) - implementationCost;
    
    const roi = implementationCost > 0 ? (fcfAdvantage / implementationCost) : 0;
    const monthlyFcfLift = (revenueAdvantage * fcfMultiplier) / 60; // Simplified: spread over 5 years
    const paybackMonths = implementationCost > 0 && monthlyFcfLift > 0 
      ? Math.ceil(implementationCost / monthlyFcfLift) 
      : null;

    // Break-even lift calculation (what lift needed to cover implementation cost via FCF)
    const breakEvenLift = implementationCost > 0 && baselineCE > 0 && fcfMultiplier > 0
      ? (implementationCost / (baselineCE * fcfMultiplier)) * 100
      : 0;

    return {
      arpa,
      baselineCLV,
      baselineCE,
      baselineFCF,
      postActionCLV,
      postActionCE,
      postActionFCF,
      revenueAdvantage,
      fcfAdvantage,
      roi,
      paybackMonths,
      breakEvenLift,
    };
  }, [arr, customerCount, monthlyChurn, annualNrr, monthlyCustomerGrowth, monthlyArpaGrowth, fcfMargin, annualDiscount, selectedAction, liftPercent, implementationCost]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const reset = () => {
    setArr(20000000);
    setCustomerCount(3500);
    setMonthlyCustomerGrowth(1.5);
    setMonthlyArpaGrowth(0.5);
    setMonthlyChurn(3);
    setAnnualNrr(110);
    setFcfMargin(20);
    setAnnualDiscount(15);
    setSelectedActionIdx(3);
    setLiftPercent(actionOptions[3].defaultLift);
    setImplementationCost(25000);
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <Calculator size={18} />
        <span>Action Value Calculator</span>
        <button className="reset-btn" onClick={reset} title="Reset to defaults">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="calculator-body">
        <div className="inputs-section">
          <div className="input-group">
            <label className="group-label">Company baseline</label>
            
            <div className="input-row">
              <label>ARR</label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatWithCommas(arr)}
                  onChange={(e) => setArr(parseFromCommas(e.target.value))}
                />
              </div>
            </div>

            <div className="input-row">
              <label>Customers</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatWithCommas(customerCount)}
                onChange={(e) => setCustomerCount(parseFromCommas(e.target.value))}
              />
            </div>

            <div className="input-row">
              <label>Monthly customer growth</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.1"
                  value={monthlyCustomerGrowth}
                  onChange={(e) => setMonthlyCustomerGrowth(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>Monthly ARPA growth</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.1"
                  value={monthlyArpaGrowth}
                  onChange={(e) => setMonthlyArpaGrowth(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>Monthly logo churn</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.1"
                  value={monthlyChurn}
                  onChange={(e) => setMonthlyChurn(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>Annual NRR</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="1"
                  value={annualNrr}
                  onChange={(e) => setAnnualNrr(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>FCF margin</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="1"
                  value={fcfMargin}
                  onChange={(e) => setFcfMargin(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>Discount rate</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  value={annualDiscount}
                  onChange={(e) => setAnnualDiscount(Number(e.target.value))}
                />
                <span className="suffix">% / yr</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="group-label">Action</label>
            
            <div className="input-row full">
              <select
                value={selectedActionIdx}
                onChange={(e) => handleActionChange(Number(e.target.value))}
              >
                {actionOptions.map((action, idx) => (
                  <option key={idx} value={idx}>
                    {action.category} → {action.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="benchmark-hint">
              Affects <strong>{metricLabels[selectedAction.defaultMetric]}</strong>
              <br />
              <span className="muted">Typical lift: {selectedAction.benchmarkRange[0]}–{selectedAction.benchmarkRange[1]}%</span>
            </div>

            <div className="input-row">
              <label>Expected lift</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="1"
                  value={liftPercent}
                  onChange={(e) => setLiftPercent(Number(e.target.value))}
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-row">
              <label>Implementation cost</label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatWithCommas(implementationCost)}
                  onChange={(e) => setImplementationCost(parseFromCommas(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="outputs-section">
          <div className="output-card baseline">
            <div className="output-label">
              Baseline <InlineMath math="v(s)" />
            </div>
            <div className="output-value">{formatCurrency(results.baselineCE)}</div>
            <div className="output-detail">
              FCF: {formatCurrency(results.baselineFCF)} at {fcfMargin}% margin
            </div>
          </div>

          <div className="output-card post-action">
            <div className="output-label">
              Post-action <InlineMath math="q(s,a)" />
            </div>
            <div className="output-value">{formatCurrency(results.postActionCE)}</div>
            <div className="output-detail">
              FCF: {formatCurrency(results.postActionFCF)} · {liftPercent >= 0 ? "+" : ""}{liftPercent}% {metricLabels[selectedAction.defaultMetric].toLowerCase()}
            </div>
          </div>

          <div className={`output-card advantage ${results.revenueAdvantage >= 0 ? "positive" : "negative"}`}>
            <div className="output-label">
              Advantage <InlineMath math="a(s,a)" />
            </div>
            <div className="output-value">
              <TrendingUp size={18} />
              {results.revenueAdvantage >= 0 ? "+" : ""}{formatCurrency(results.revenueAdvantage)}
            </div>
            <div className="output-detail">
              FCF: {results.fcfAdvantage >= 0 ? "+" : ""}{formatCurrency(results.fcfAdvantage)} after {formatCurrency(implementationCost)} cost
            </div>
          </div>

          <div className="output-row">
            <div className="output-mini">
              <DollarSign size={14} />
              <span className="mini-label">ROI</span>
              <span className="mini-value">{results.roi.toFixed(1)}×</span>
            </div>
            <div className="output-mini">
              <Clock size={14} />
              <span className="mini-label">Payback</span>
              <span className="mini-value">
                {results.paybackMonths ? `${results.paybackMonths} mo` : "—"}
              </span>
            </div>
          </div>

          <div className="break-even">
            Break-even lift required: <strong>{results.breakEvenLift.toFixed(2)}%</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calculator {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: var(--space-6);
          overflow: hidden;
        }

        .calculator-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 16px;
          background: var(--fg);
          color: var(--bg);
        }

        .reset-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--bg);
          cursor: pointer;
          opacity: 0.6;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s;
        }

        .reset-btn:hover {
          opacity: 1;
        }

        .calculator-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .calculator-body {
            grid-template-columns: 1fr;
          }
        }

        .inputs-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .group-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .input-row.full {
          flex-direction: column;
          align-items: stretch;
        }

        .input-row label {
          font-size: 13px;
          color: var(--fg);
          opacity: 0.8;
        }

        .input-row input,
        .input-row select {
          width: 120px;
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg);
          color: var(--fg);
          font-family: var(--font-geist-mono), monospace;
        }

        .input-row.full select {
          width: 100%;
        }

        .input-row input:focus,
        .input-row select:focus {
          outline: none;
          border-color: var(--fg);
        }

        .input-with-prefix,
        .input-with-suffix {
          display: flex;
          align-items: center;
        }

        .input-with-prefix input {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          width: 100px;
        }

        .input-with-suffix input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          width: 80px;
          text-align: right;
        }

        .prefix,
        .suffix {
          padding: 6px 8px;
          font-size: 12px;
          background: color-mix(in srgb, var(--fg) 5%, transparent);
          border: 1px solid var(--border);
          color: var(--muted);
        }

        .prefix {
          border-right: none;
          border-radius: 4px 0 0 4px;
        }

        .suffix {
          border-left: none;
          border-radius: 0 4px 4px 0;
        }

        .benchmark-hint {
          font-size: 11px;
          color: var(--muted);
          padding: 8px 10px;
          background: color-mix(in srgb, var(--fg) 3%, transparent);
          border-radius: 4px;
          line-height: 1.4;
        }

        .benchmark-hint strong {
          color: var(--fg);
        }

        .outputs-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .output-card {
          padding: 14px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .output-card.baseline {
          background: color-mix(in srgb, var(--fg) 3%, transparent);
        }

        .output-card.post-action {
          background: color-mix(in srgb, var(--fg) 5%, transparent);
        }

        .output-card.advantage {
          border-width: 2px;
        }

        .output-card.advantage.positive {
          border-color: #22c55e;
          background: color-mix(in srgb, #22c55e 8%, transparent);
        }

        .output-card.advantage.negative {
          border-color: #ef4444;
          background: color-mix(in srgb, #ef4444 8%, transparent);
        }

        .output-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .output-value {
          font-size: 24px;
          font-weight: 700;
          font-family: var(--font-geist-mono), monospace;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .output-card.advantage.positive .output-value {
          color: #16a34a;
        }

        .output-card.advantage.negative .output-value {
          color: #dc2626;
        }

        .output-detail {
          font-size: 11px;
          color: var(--muted);
          margin-top: 4px;
        }

        .output-row {
          display: flex;
          gap: 12px;
        }

        .output-mini {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
        }

        .mini-label {
          color: var(--muted);
        }

        .mini-value {
          margin-left: auto;
          font-weight: 600;
          font-family: var(--font-geist-mono), monospace;
        }

        .break-even {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid var(--border);
        }

        .break-even strong {
          color: var(--fg);
        }
      `}</style>
    </div>
  );
}

