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
      <h2 className="section-title" style={{ marginTop: 0 }}>Decisions</h2>
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
            The strongest identification assumption is <strong>unconditional randomization</strong>: the action is independent of potential outcomes.
          </p>
          <BlockMath math="a \perp r(a) \quad \text{for each } a" />
          <p>
            This is rare in practice—true A/B tests with proper randomization. When it holds, you can directly compare average outcomes across treatment groups. No modeling required, no confounders to worry about.
          </p>

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
            <strong>Thompson Sampling</strong> turns posterior uncertainty directly into exploration. At each step, sample a parameter vector from the current posterior and act as if it were true:
          </p>
          <BlockMath math="\tilde{\theta}_t \sim p_t(\theta), \qquad a_t = \arg\max_a \, \tilde{\theta}_{t,a}" />

          <p>
            This is <em>probability matching</em>: each action is chosen with probability equal to its posterior probability of being optimal. No tuning parameters, no explicit exploration bonus—uncertainty in the posterior automatically drives exploration where it's needed.
          </p>

          <p>
            Thompson Sampling achieves <strong>optimal regret</strong> up to constants. For <InlineMath math="k" /> arms with sub-Gaussian rewards, the Bayesian regret is:
          </p>
          <BlockMath math="\mathbb{E}[\mathrm{Regret}(T)] = O\left(\sqrt{kT \log T}\right)" />

          <p>
            More precisely, it matches the Lai-Robbins lower bound asymptotically: regret scales with <InlineMath math="\sum_{a: \Delta_a > 0} \frac{\log T}{\mathrm{KL}(\theta_a \| \theta^*)}" /> where <InlineMath math="\Delta_a = \theta^* - \theta_a" /> is the gap. Arms that are clearly suboptimal get eliminated quickly; arms close to optimal require more samples to distinguish.
          </p>

          <h3 id="quasi-random-assignment">Quasi-random assignment</h3>

          <p>
            The weaker but more common assumption is <strong>conditional randomization</strong>: after conditioning on the state that drove the decision, the remaining variation in action is as-if random.
          </p>
          <BlockMath math="a \perp r(a) \mid s" />
          <p>
            This means you need the propensity <InlineMath math="\pi(a \mid s)" />, not just <InlineMath math="\pi(a)" />. The state <InlineMath math="s" /> must capture everything that jointly affects both which action was taken and what the outcome would have been—the <em>confounders</em>.
          </p>

          <p>
            Not all variation is designed. Rollouts happen in waves. Pricing changes hit cohorts at different times. Sales reps go on vacation. Support queues overflow. These accidents create <strong>natural experiments</strong>—quasi-random variation in who gets what action, when.
          </p>

          <p>
            The key insight: if you logged the actions taken under some <strong>behavior policy</strong> <InlineMath math="\pi_b" />, you can evaluate a different <strong>target policy</strong> <InlineMath math="\pi" /> without running it. This is <strong>off-policy evaluation</strong>. The importance-weighted estimator reweights observed rewards by how much more (or less) likely the target policy would have taken each action:
          </p>
          <BlockMath math="\hat{V}(\pi) = \frac{1}{n} \sum_{i=1}^n \frac{\pi(a_i \mid x_i)}{\pi_b(a_i \mid x_i)} \, r_i" />

          <p>
            where <InlineMath math="x_i" /> is context, <InlineMath math="a_i" /> is the action taken, and <InlineMath math="r_i" /> is the observed reward. The ratio <InlineMath math="\pi(a)/\pi_b(a)" /> is the <strong>importance weight</strong>—it corrects for the distribution shift between what was done and what you wish had been done.
          </p>

          <p>
            This works when you have <strong>overlap</strong>: any action the target policy might take must have positive probability under the behavior policy. No overlap, no learning—you can't evaluate actions you never tried. Variance blows up when importance weights are large, so practical estimators use clipping, self-normalization, or doubly robust corrections.
          </p>

          <p>
            The same logic extends to sequential decisions. If you have a logged trajectory <InlineMath math="(x_1, a_1, r_1, \ldots, x_T, a_T, r_T)" /> from behavior policy <InlineMath math="\pi_b" />, you can evaluate target policy <InlineMath math="\pi" /> using the cumulative importance weight:
          </p>
          <BlockMath math="\hat{V}(\pi) = \frac{1}{n} \sum_{i=1}^n \left( \prod_{t=1}^{T} \frac{\pi(a_{i,t} \mid h_{i,t})}{\pi_b(a_{i,t} \mid h_{i,t})} \right) R_i" />

          <p>
            where <InlineMath math="h_t" /> is the history up to time <InlineMath math="t" /> and <InlineMath math="R_i" /> is the total reward for trajectory <InlineMath math="i" />. The product of ratios compounds—variance grows exponentially with horizon, making long-horizon off-policy evaluation notoriously difficult.
          </p>
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
