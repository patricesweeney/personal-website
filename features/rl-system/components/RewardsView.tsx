"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

export function RewardsView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Rewards</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A SaaS company objective is to maximize expected discounted free cash flow. This follows tautologically from the firm's survival imperative. Under competition, firms that do not generate sufficient discounted cash flow relative to rivals lose financing, lose investment, and exit. Shaikh's argument is that this objective is imposed by competitive selection: capital reallocates toward higher risk-adjusted returns, so persistent deviation from discounted profit maximization is not sustainable.
          </p>

          <p>
            This objective decomposes into maximizing return on invested capital (ROIC) and maximizing growth of the invested capital base. Under standard SaaS conditions this is well-approximated by revenue growth, so revenue is taken as the reward signal and denoted <InlineMath math="r" />. The startup industry typically collapses the objective to revenue and ignores ROIC.
          </p>

          <p>
            The policy objective is to maximize long-run revenue, also called <strong>customer equity</strong>. Let <InlineMath math="\gamma \in (0,1)" /> be the discount factor. <InlineMath math="\gamma" /> corresponds to both the firm's WACC (the required rate of return) and its effective risk preference: higher capital costs or higher risk aversion imply lower <InlineMath math="\gamma" />.
          </p>

          <p>
            A policy <InlineMath math="\pi" /> is a decision rule that selects actions as a function of the company's current state (interpreted broadly to include beliefs from telemetry, sales signals, and finance outcomes). Customer equity under <InlineMath math="\pi" /> is:
          </p>
          <BlockMath math="CE(\pi) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \right]" />

          <p>
            <InlineMath math="V^\pi(s)" /> is the expected discounted future revenue starting from state <InlineMath math="s" /> and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s \right]" />

          <p>
            <InlineMath math="Q^\pi(s,a)" /> is the expected discounted future revenue starting from state <InlineMath math="s" />, taking action <InlineMath math="a" /> immediately, and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_0 = a \right]" />

          <p>
            The linkage remains <InlineMath math="V^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot|s)}[ Q^\pi(s,a) ]" />.
          </p>
        </div>
      </div>
    </section>
  );
}
