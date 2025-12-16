"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { ActionsTree } from "./ActionsTree";
import { ActionValueCalculator } from "./ActionValueCalculator";

export function ActionsView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Actions</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A SaaS company's action space spans three domains: <strong>product</strong> (what value is created), <strong>pricing</strong> (how value is captured), and <strong>promotion</strong> (how value is communicated and distributed).
          </p>
          <ActionsTree />

          <p style={{ marginTop: "var(--space-6)" }}>
            For each action, we want to know its <strong>Q-value</strong> <InlineMath math="Q^\pi(s,a)" />—the expected future customer equity from taking action <InlineMath math="a" /> in state <InlineMath math="s" /> and then following policy <InlineMath math="\pi" />—and its <strong>advantage</strong> <InlineMath math="A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)" /> over the baseline policy.
          </p>
          <p>
            These concepts map directly to the <strong>potential outcomes</strong><sup><a href="#ref-1" className="cite">1</a></sup> and <strong>do-calculus</strong><sup><a href="#ref-2" className="cite">2</a></sup> frameworks from causal inference:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}[Y \mid \mathrm{do}(A=a), S=s]" />
          <p>
            The Q-value is the <strong>interventional expectation</strong>—the expected outcome if we <em>intervene</em> to set <InlineMath math="A=a" />, not merely observe it. In potential outcomes notation, this is <InlineMath math="\mathbb{E}[Y(a) \mid S=s]" />, the expected potential outcome under treatment <InlineMath math="a" />.
          </p>
          <p>
            The advantage function is then the <strong>conditional average treatment effect</strong> (CATE),<sup><a href="#ref-3" className="cite">3</a></sup> also called <strong>uplift</strong>:<sup><a href="#ref-4" className="cite">4</a></sup>
          </p>
          <BlockMath math="A^\pi(s,a) = \mathbb{E}[Y(a) - Y(\pi) \mid S=s] = \tau(s,a)" />
          <p>
            This is precisely what uplift models estimate: the incremental effect of taking action <InlineMath math="a" /> versus following the default policy, conditional on state. A positive advantage means the action <em>causes</em> higher expected customer equity than the baseline—not merely that it correlates with better outcomes.
          </p>

          <ActionValueCalculator />

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Rubin, D. B. (2005). Causal inference using potential outcomes: Design, modeling, decisions. <em>Journal of the American Statistical Association</em>, 100(469), 322–331.</li>
              <li id="ref-2"><sup>2</sup> Pearl, J. (2009). <em>Causality: Models, reasoning, and inference</em> (2nd ed.). Cambridge University Press.</li>
              <li id="ref-3"><sup>3</sup> Athey, S., & Imbens, G. W. (2016). Recursive partitioning for heterogeneous causal effects. <em>Proceedings of the National Academy of Sciences</em>, 113(27), 7353–7360.</li>
              <li id="ref-4"><sup>4</sup> Radcliffe, N. J., & Surry, P. D. (2011). Real-world uplift modelling with significance-based uplift trees. <em>White Paper TR-2011-1</em>, Stochastic Solutions.</li>
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
          padding-left: 0;
          list-style: none;
          color: var(--muted);
        }
        .references li {
          margin-bottom: var(--space-2);
        }
      `}</style>
    </section>
  );
}
