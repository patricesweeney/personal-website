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

const BayesianTestingDemo = dynamic(
  () => import("./BayesianTestingDemo").then((mod) => mod.BayesianTestingDemo),
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

          <h3 id="identification">Identification</h3>
          <p>
            <strong>Identification</strong> is the problem of determining whether—and under what assumptions—causal effects can be recovered from data. In SaaS, actions are rarely randomized: discounts go to at-risk customers, features ship to power users, sales reps prioritize high-value leads. The question is whether you can still learn what <em>would have happened</em> under different actions.
          </p>
          <ol className="identification-list">
            <li>
              <strong>Randomized assignment.</strong> A/B tests, holdouts, cluster randomization. Identification by design.
            </li>
            <li>
              <strong>Quasi-random assignment.</strong> Rollouts, thresholds, policy switches, cohort cutovers, DiD/RD style variation. Identification by design assumptions.
            </li>
            <li>
              <strong>Targeted assignment.</strong> Sales, CS, pricing discretion, support prioritization, save offers, human or heuristic targeting. Identification by modeling plus strong ignorability/overlap assumptions or instruments.
            </li>
          </ol>

          <h3 id="randomized-assignment">Randomized assignment</h3>

          <p>
            <strong>Generalized Bayes</strong> updates beliefs by exponentiating negative loss. After observing action <InlineMath math="a_t" /> and reward <InlineMath math="r_t" />, beliefs update as:
          </p>
          <BlockMath math="p_{t+1}(\theta) \propto p_t(\theta) \, \exp\bigl(-\eta \, \ell(\theta; a_t, r_t)\bigr)" />
          <p>
            where <InlineMath math="\eta > 0" /> controls how strongly the data influences beliefs—higher <InlineMath math="\eta" /> means more trust in data, lower <InlineMath math="\eta" /> means more conservatism. After <InlineMath math="t" /> observations <InlineMath math="\mathcal{D}_t = \{(a_s, r_s)\}_{s=1}^t" />, this accumulates to:
          </p>
          <BlockMath math="p_t(\theta) \propto p_0(\theta) \, \exp\left(-\eta \sum_{s=1}^t \ell(\theta; a_s, r_s)\right)" />

          <p>
            This update can be understood variationally: the posterior <InlineMath math="p_t" /> minimizes the expected loss plus a KL penalty for complexity:
          </p>
          <BlockMath math="p_t = \arg\min_p \left\{ \underbrace{\mathbb{E}_p\left[\sum_{s=1}^t \ell(\theta; a_s, r_s)\right]}_{\text{accuracy}} + \underbrace{\frac{1}{\eta} D_{\mathrm{KL}}[p(\theta) \| p_0(\theta)]}_{\text{complexity}} \right\}" />

          <p>
            For decision-making, actions combine <strong>exploitation</strong> (expected reward) and <strong>exploration</strong> (information gain). The expected reward for arm <InlineMath math="a" /> is the posterior mean:
          </p>
          <BlockMath math="\mu_t(a) = \mathbb{E}_{p_t(\theta)}[\theta_a]" />

          <p>
            The epistemic value (information gain) measures how much pulling arm <InlineMath math="a" /> would teach us about <InlineMath math="\theta" />:
          </p>
          <BlockMath math="\mathrm{IG}_t(a) = \mathbb{E}_{r \sim p_t(r|a)} \left[ D_{\mathrm{KL}}[p_t(\theta|r,a) \| p_t(\theta)] \right]" />
          <p>
            where <InlineMath math="p_t(\theta|r,a)" /> is the hypothetical posterior if we observed reward <InlineMath math="r" /> from arm <InlineMath math="a" />:
          </p>
          <BlockMath math="p_t(\theta|r,a) \propto p_t(\theta) \, \exp\bigl(-\eta \, \ell(\theta; a, r)\bigr)" />

          <p>
            To compute this, we need the posterior predictive distribution <InlineMath math="p_t(r|a)" /> over possible rewards. Two common choices:
          </p>
          <ul>
            <li><strong>Model-based:</strong> integrate over current beliefs about parameters</li>
            <li><strong>Loss-induced:</strong> use the loss function as a pseudo-likelihood</li>
          </ul>

          <p>
            The decision rule trades off reward and information with exchange rate <InlineMath math="\kappa" /> (how much one nat of information is worth in reward units):
          </p>
          <BlockMath math="a_t = \arg\max_a \quad \mu_t(a) + \kappa \, \mathrm{IG}_t(a)" />

          <p>
            For stochastic policies, add softmax with temperature <InlineMath math="\beta" />:
          </p>
          <BlockMath math="P(a_t = a) \propto \exp\bigl(\beta [\mu_t(a) + \kappa \, \mathrm{IG}_t(a)]\bigr)" />
        </div>
      </div>

      <style jsx>{`
        .identification-list {
          margin: var(--space-4) 0;
          padding-left: var(--space-5);
        }
        .identification-list li {
          margin-bottom: var(--space-3);
        }
      `}</style>
    </section>
  );
}
