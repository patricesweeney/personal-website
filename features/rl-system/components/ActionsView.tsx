"use client";

import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const FirmBoundaryDemo = dynamic(
  () => import("./FirmBoundaryDemo").then((mod) => mod.FirmBoundaryDemo),
  { ssr: false }
);

const ActionsTree = dynamic(
  () => import("./ActionsTree").then((mod) => mod.ActionsTree),
  { ssr: false }
);


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

          <h3 id="causal-inference">Causal inference</h3>
          <p>
            Causal inference asks: what happens if we <em>intervene</em>? This differs from prediction. Observing that customers who use feature X have higher retention doesn't mean enabling X for everyone will improve retention—maybe engaged customers both use X and stick around.
          </p>
          <p>
            <strong>Static setting.</strong> Pearl's structural causal models<sup><a href="#ref-1" className="cite">1</a></sup> formalize this with the <InlineMath math="\mathrm{do}" />-operator. The causal effect of action <InlineMath math="a" /> is <InlineMath math="\mathbb{E}[Y \mid \mathrm{do}(A=a)]" />—the expected outcome when we <em>set</em> <InlineMath math="A=a" />, not merely observe it. Under the right assumptions (no unmeasured confounding, positivity), this equals <InlineMath math="\mathbb{E}[Y(a)]" /> in potential outcomes notation.
          </p>
          <p>
            <strong>Dynamic setting.</strong> SaaS involves sequences of actions over time: onboarding flows, pricing changes, feature releases. Robins' g-methods<sup><a href="#ref-2" className="cite">2</a></sup> extend causal inference to these sequential settings. The <strong>g-formula</strong> identifies the effect of a treatment <em>strategy</em>—a sequence of actions <InlineMath math="\bar{a} = (a_0, a_1, \ldots, a_T)" />—by iteratively adjusting for time-varying confounders:
          </p>
          <BlockMath math="\mathbb{E}[Y(\bar{a})] = \sum_{\bar{l}} \mathbb{E}[Y \mid \bar{A}=\bar{a}, \bar{L}=\bar{l}] \prod_t P(L_t \mid \bar{A}_{t-1}, \bar{L}_{t-1})" />
          <p>
            This is the foundation for understanding RL through a causal lens: the value function <InlineMath math="V^\pi(s)" /> is the expected outcome under policy <InlineMath math="\pi" />, which is exactly a g-formula computation. The Q-value <InlineMath math="Q^\pi(s,a)" /> asks what happens if we intervene with action <InlineMath math="a" /> now, then follow <InlineMath math="\pi" /> thereafter.
          </p>

          <div className="terminology-table">
            <table>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Computer Science</th>
                  <th>Economics</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Expected outcome from a state</td>
                  <td>Value function <InlineMath math="V(s)" /></td>
                  <td>Conditional mean <InlineMath math="\mathbb{E}[Y \mid X=x]" /></td>
                </tr>
                <tr>
                  <td>Expected outcome from taking action</td>
                  <td>Q-value <InlineMath math="Q(s,a)" /></td>
                  <td>Potential outcome <InlineMath math="Y(a)" />, CATE</td>
                </tr>
                <tr>
                  <td>Improvement over baseline</td>
                  <td>Advantage <InlineMath math="A(s,a)" /></td>
                  <td>Treatment effect <InlineMath math="\tau" />, uplift</td>
                </tr>
                <tr>
                  <td>Decision rule</td>
                  <td>Policy <InlineMath math="\pi(a|s)" /></td>
                  <td>Decision rule, targeting rule</td>
                </tr>
                <tr>
                  <td>Learning from logged data</td>
                  <td>Off-policy evaluation<sup><a href="#ref-3" className="cite">3</a></sup></td>
                  <td>Observational causal inference<sup><a href="#ref-4" className="cite">4</a></sup></td>
                </tr>
                <tr>
                  <td>Action selection bias</td>
                  <td>Behavior policy mismatch<sup><a href="#ref-3" className="cite">3</a></sup></td>
                  <td>Selection on observables/unobservables<sup><a href="#ref-5" className="cite">5</a></sup></td>
                </tr>
                <tr>
                  <td>Correcting for selection</td>
                  <td>Importance sampling<sup><a href="#ref-6" className="cite">6</a></sup>, doubly robust<sup><a href="#ref-7" className="cite">7</a></sup></td>
                  <td>IPW<sup><a href="#ref-8" className="cite">8</a></sup>, AIPW<sup><a href="#ref-9" className="cite">9</a></sup></td>
                </tr>
                <tr>
                  <td>Identification strategies</td>
                  <td>Causal graph identifiability<sup><a href="#ref-10" className="cite">10</a></sup></td>
                  <td>IV<sup><a href="#ref-11" className="cite">11</a></sup>, RDD<sup><a href="#ref-12" className="cite">12</a></sup>, DiD<sup><a href="#ref-13" className="cite">13</a></sup></td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Pearl, J. (2009). <em>Causality: Models, reasoning, and inference</em> (2nd ed.). Cambridge University Press.</li>
              <li id="ref-2"><sup>2</sup> Robins, J. M. (1986). A new approach to causal inference in mortality studies with a sustained exposure period. <em>Mathematical Modelling</em>, 7(9–12), 1393–1512.</li>
              <li id="ref-3"><sup>3</sup> Precup, D., Sutton, R. S., & Singh, S. (2000). Eligibility traces for off-policy policy evaluation. <em>Proceedings of the 17th International Conference on Machine Learning</em>, 759–766.</li>
              <li id="ref-4"><sup>4</sup> Rosenbaum, P. R., & Rubin, D. B. (1983). The central role of the propensity score in observational studies for causal effects. <em>Biometrika</em>, 70(1), 41–55.</li>
              <li id="ref-5"><sup>5</sup> Heckman, J. J. (1979). Sample selection bias as a specification error. <em>Econometrica</em>, 47(1), 153–161.</li>
              <li id="ref-6"><sup>6</sup> Kahn, H., & Marshall, A. W. (1953). Methods of reducing sample size in Monte Carlo computations. <em>Journal of the Operations Research Society of America</em>, 1(5), 263–278.</li>
              <li id="ref-7"><sup>7</sup> Dudík, M., Langford, J., & Li, L. (2011). Doubly robust policy evaluation and learning. <em>Proceedings of the 28th International Conference on Machine Learning</em>, 1097–1104.</li>
              <li id="ref-8"><sup>8</sup> Horvitz, D. G., & Thompson, D. J. (1952). A generalization of sampling without replacement from a finite universe. <em>Journal of the American Statistical Association</em>, 47(260), 663–685.</li>
              <li id="ref-9"><sup>9</sup> Robins, J. M., Rotnitzky, A., & Zhao, L. P. (1994). Estimation of regression coefficients when some regressors are not always observed. <em>Journal of the American Statistical Association</em>, 89(427), 846–866.</li>
              <li id="ref-10"><sup>10</sup> Shpitser, I., & Pearl, J. (2006). Identification of joint interventional distributions in recursive semi-Markovian causal models. <em>Proceedings of the 21st National Conference on Artificial Intelligence</em>, 1219–1226.</li>
              <li id="ref-11"><sup>11</sup> Angrist, J. D., Imbens, G. W., & Rubin, D. B. (1996). Identification of causal effects using instrumental variables. <em>Journal of the American Statistical Association</em>, 91(434), 444–455.</li>
              <li id="ref-12"><sup>12</sup> Imbens, G. W., & Lemieux, T. (2008). Regression discontinuity designs: A guide to practice. <em>Journal of Econometrics</em>, 142(2), 615–635.</li>
              <li id="ref-13"><sup>13</sup> Bertrand, M., Duflo, E., & Mullainathan, S. (2004). How much should we trust differences-in-differences estimates? <em>Quarterly Journal of Economics</em>, 119(1), 249–275.</li>
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
        .terminology-table {
          margin: var(--space-5) 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        .terminology-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .terminology-table th,
        .terminology-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .terminology-table th {
          background: var(--bg);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--muted);
        }
        .terminology-table tbody tr:last-child td {
          border-bottom: none;
        }
        .terminology-table tbody tr:hover {
          background: color-mix(in srgb, var(--fg) 2%, transparent);
        }
        .terminology-table td:first-child {
          font-weight: 500;
          color: var(--fg);
        }
        .terminology-table td:not(:first-child) {
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
          font-size: 13px;
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
