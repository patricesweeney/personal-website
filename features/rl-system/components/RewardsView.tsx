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
            A profit-seeking firm's objective is to maximize expected discounted free cash flow (enterprise value).<sup><a href="#ref-1" className="cite">1</a></sup> This decomposes into maximizing returns on invested capital and scaling the invested-capital base.<sup><a href="#ref-2" className="cite">2</a></sup>
          </p>

          <p>
            For early-stage SaaS, free cash flow is often negative, noisy, and lagging, so a workable proxy is <strong>customer equity</strong>,<sup><a href="#ref-3" className="cite">3</a></sup> expected discounted revenue from the present and future customer base. Accordingly, take revenue as the reward signal <InlineMath math="r_t" />. Therefore, a SaaS startup's policy objective is:
          </p>
          <BlockMath math="\pi^* \in \arg\max_{\pi}\ \mathbb{E}\!\left[\sum_{t=0}^{\infty}\gamma^{t} r_t \right], \qquad \gamma\in(0,1)" />
          <p>
            Here <InlineMath math="\pi" /> is the company's policy and <InlineMath math="\gamma" /> is its discount factor (hurdle rate/WACC, or equivalently an effective risk preference).
          </p>

          <p>
            The <strong>state-value function</strong> <InlineMath math="V^\pi(s)" /> is the expected discounted future revenue starting from state <InlineMath math="s" /> and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s \right]" />

          <p>
            The <strong>state-action value function</strong> <InlineMath math="Q^\pi(s,a)" /> is the expected discounted future revenue starting from state <InlineMath math="s" />, taking action <InlineMath math="a" /> immediately, and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_0 = a \right]" />

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1">Shaikh, A. (2016). <em>Capitalism: Competition, conflict, crises</em>. Oxford University Press.</li>
              <li id="ref-2">Koller, T., Goedhart, M., & Wessels, D. (2025). <em>Valuation: Measuring and managing the value of companies</em>. John Wiley & Sons.</li>
              <li id="ref-3">Rust, R. T., Lemon, K. N., & Zeithaml, V. A. (2004). Return on marketing: Using customer equity to focus marketing strategy. <em>Journal of Marketing</em>, 68(1), 109–127.</li>
            </ol>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cite {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.75em;
        }
        .cite:hover {
          color: var(--fg);
          text-decoration: underline;
        }
        .references-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: var(--space-10) 0 var(--space-6) 0;
        }
        .references {
          font-size: var(--font-small);
        }
        .references ol {
          margin: var(--space-3) 0 0 0;
          padding-left: var(--space-5);
          color: var(--muted);
        }
        .references li {
          margin-bottom: var(--space-2);
        }
      `}</style>
    </section>
  );
}
