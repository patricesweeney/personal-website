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
            A SaaS company objective is to maximize expected discounted free cash flow.<sup><a href="#ref-1" className="cite">1</a></sup> This objective decomposes into maximizing return on invested capital (ROIC) and maximizing growth of the invested capital base.<sup><a href="#ref-2" className="cite">2</a></sup> Under standard SaaS conditions this is well-approximated by revenue growth, so revenue is taken as the reward signal and denoted <InlineMath math="r" />.
          </p>

          <p>
            The firm's policy objective is to maximize expected discounted revenue (<strong>customer equity</strong>):
          </p>
          <BlockMath math="\pi^* \in \arg\max_{\pi}\ \mathbb{E}\!\left[\sum_{t=0}^{\infty}\gamma^{t} R_t \right], \qquad \gamma\in(0,1)" />
          <p>
            Here <InlineMath math="\pi" /> is the firm's policy, and <InlineMath math="\gamma" /> is its discount factor, interpretable as a hurdle rate/WACC and, equivalently, an effective risk preference (lower <InlineMath math="\gamma" /> means more impatient or more risk-averse).
          </p>

          <p>
            <InlineMath math="V^\pi(s)" /> is the expected discounted future revenue starting from state <InlineMath math="s" /> and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s \right]" />

          <p>
            <InlineMath math="Q^\pi(s,a)" /> is the expected discounted future revenue starting from state <InlineMath math="s" />, taking action <InlineMath math="a" /> immediately, and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_0 = a \right]" />

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1">Shaikh, A. (2016). <em>Capitalism: Competition, conflict, crises</em>. Oxford University Press.</li>
              <li id="ref-2">Koller, T., Goedhart, M., & Wessels, D. (2025). <em>Valuation: Measuring and managing the value of companies</em>. John Wiley & Sons.</li>
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
