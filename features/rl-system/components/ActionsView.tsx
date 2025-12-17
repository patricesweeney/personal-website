"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { ActionsTree } from "./ActionsTree";
import { ActionValueCalculator } from "./ActionValueCalculator";
import { FirmBoundaryDemo } from "./FirmBoundaryDemo";

export function ActionsView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Actions</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <h3 id="crossing-the-boundary">Crossing the boundary</h3>
          <p>
            An <strong>action</strong> is anything that crosses the boundary between the company and its customers. A feature they use. A price they see. A message they read.
          </p>
          <p>
            Internally, you can hold as many meetings, write as many specs, and refactor as much code as you like. None of it touches revenue until it ships—until something crosses the boundary and makes contact with a customer.
          </p>

          <FirmBoundaryDemo />

          <p style={{ marginTop: "var(--space-6)" }}>
            The implication: if it doesn't cross the boundary, it doesn't directly affect revenue. Meetings, planning, refactoring—none of it has financial impact on its own. Any value it creates is <em>derived</em> from the actions it eventually enables.
          </p>

          <h3 id="canonical-actions">Canonical actions</h3>
          <p>
            So what counts as an action? Everything a SaaS company does that customers can observe falls into three buckets: <strong>product</strong> (what you build), <strong>pricing</strong> (what you charge), and <strong>promotion</strong> (how you sell it).
          </p>
          <ActionsTree />

          <h3 id="identification">Identification</h3>
          <p>
            For any action, two questions matter. First: what happens if I do this? That's the <strong>Q-value</strong> <InlineMath math="Q^\pi(s,a)" />—the expected future CE from taking action <InlineMath math="a" /> now and then reverting to the usual policy. Second: is that better than what I'd normally do? That's the <strong>advantage</strong> <InlineMath math="A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)" />.
          </p>
          <p>
            These are causal questions, not correlational ones. The Q-value asks what happens if you <em>make</em> something happen, not what you'd expect to see when it happens on its own.<sup><a href="#ref-1" className="cite">1</a>,<a href="#ref-2" className="cite">2</a></sup>
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}[Y \mid \mathrm{do}(A=a), S=s]" />
          <p>
            The advantage is then the treatment effect—how much better off you are for having acted, compared to the baseline.<sup><a href="#ref-3" className="cite">3</a></sup> In marketing, this is called <strong>uplift</strong>:<sup><a href="#ref-4" className="cite">4</a></sup>
          </p>
          <BlockMath math="A^\pi(s,a) = \mathbb{E}[Y(a) - Y(\pi) \mid S=s] = \tau(s,a)" />
          <p>
            Positive advantage means the action <em>causes</em> higher CE than doing nothing special. Correlation won't cut it—you need to know the counterfactual.
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
        .action-categories {
          margin: var(--space-3) 0 var(--space-4) var(--space-4);
          padding: 0;
        }
        .action-categories li {
          margin-bottom: var(--space-2);
        }
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
