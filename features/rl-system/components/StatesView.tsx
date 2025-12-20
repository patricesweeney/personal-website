"use client";

import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const ObservationsMindMap = dynamic(
  () => import("./ObservationsMindMap").then((mod) => mod.ObservationsMindMap),
  { ssr: false }
);

const StateSpaceVisual = dynamic(
  () => import("./StateSpaceVisual").then((mod) => mod.StateSpaceVisual),
  { ssr: false }
);

const FactorLoadingsVisual = dynamic(
  () => import("./FactorLoadingsVisual").then((mod) => mod.FactorLoadingsVisual),
  { ssr: false }
);

const SurvivalVisual = dynamic(
  () => import("./SurvivalVisual").then((mod) => mod.SurvivalVisual),
  { ssr: false }
);

const FrailtyVisual = dynamic(
  () => import("./FrailtyVisual").then((mod) => mod.FrailtyVisual),
  { ssr: false }
);

export function StatesView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Customer states</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            SaaS companies drown in data—telemetry, CRM, billing, tickets, surveys—and most of it is noise. The problem isn't getting information; it's figuring out what matters.
          </p>
          <p>
            You don't get <strong>states</strong> for free. You get <em>observations</em>: raw, high-dimensional, redundant. A state is a compressed summary that's good enough to act on. If two observations map to the same state, the right action should be the same for both. That's the bar.
          </p>

          <h3 id="observations">Observations</h3>
          <p>
            The raw inputs come in three flavors:
          </p>
          <ObservationsMindMap />

          <h3 id="representation-learning" style={{ marginTop: "var(--space-8)" }}>Representation learning</h3>
          <p>
            For each customer <InlineMath math="i" /> at each time <InlineMath math="t" />, you observe a vector <InlineMath math="o \in \mathbb{R}^N" />—thousands of features from telemetry, CRM, billing, support. You need to compress it to a state <InlineMath math="s \in \mathbb{R}^M" /> where <InlineMath math="M \ll N" />. The function <InlineMath math="o \mapsto s" /> is the representation.
          </p>
          <p>
            Choosing <InlineMath math="M" /> is a tradeoff. More dimensions means more accuracy—the state captures finer distinctions that matter for predicting value. Fewer dimensions means less complexity—the state is parsimonious, interpretable, auditable. You want factors humans recognize (engagement, intent, satisfaction) because you need to inspect them, override them, and explain decisions based on them. A black-box embedding that predicts value perfectly but means nothing to a human is useless for building trust or catching errors.
          </p>
          <StateSpaceVisual />

          <h3 id="poisson-factorisation">Poisson factorisation</h3>
          <p>
            Customer event data is counts: logins per week, features used per session, tickets opened per month. <strong>Poisson factorisation</strong><sup><a href="#ref-1" className="cite">1</a></sup> decomposes a count matrix into latent factors, assuming each count is Poisson-distributed with a rate determined by the product of user and item factors.
          </p>
          <p>
            For a matrix <InlineMath math="o" /> of customers × events, you learn <InlineMath math="o_{ij} \sim \text{Poisson}(s_i^\top w_j)" /> where <InlineMath math="s_i" /> is customer <InlineMath math="i" />'s latent state and <InlineMath math="w_j" /> is the weight vector for event type <InlineMath math="j" />. The <InlineMath math="s_i" /> vectors are your state representations.
          </p>
          <p>
            For adoption data—did the customer use feature <InlineMath math="j" /> or not—binarize the counts and use Bernoulli-Poisson factorisation:<sup><a href="#ref-2" className="cite">2</a></sup> <InlineMath math="o_{ij} \in \{0,1\}" /> with <InlineMath math="P(o_{ij} = 1) = 1 - e^{-s_i^\top w_j}" />. Same latent structure, but the likelihood matches the binary observation. Useful when frequency doesn't matter, only adoption.
          </p>
          <p>
            In practice, complexity is the number of factors <InlineMath math="M \in \{1,2,3,4,5\}" />. Choose <InlineMath math="M" /> by reconstruction loss <InlineMath math="\sum_{ij}(o_{ij} - \hat{o}_{ij})^2" /> on cross-validation, where <InlineMath math="\hat{o}_{ij} = s_i^\top w_j" />. More factors fit better until they start overfitting. To enforce sparsity, use Laplace (L1) priors on the weights: most <InlineMath math="w_{jk}" /> shrink to zero, leaving only the features that matter for each factor.
          </p>
          <p>
            Train with <InlineMath math="t" /> as a timestep (e.g., month) and you get <InlineMath math="N \times T" /> observations—one state vector <InlineMath math="s_{it}" /> per customer per period. This is a memoryless sequence encoder: each timestep is independent, no recurrence, but you get a trajectory of states over time.
          </p>

          <FactorLoadingsVisual />

          <h3 id="survival-models">Survival models</h3>
          <p>
            Churn is a time-to-event problem. <strong>Survival models</strong> predict when a customer will churn, not just whether. The hazard function <InlineMath math="h(t|s)" /> gives the instantaneous risk of churning at time <InlineMath math="t" />, conditional on state <InlineMath math="s" />.
          </p>
          <p>
            Cox proportional hazards assumes <InlineMath math="h(t|s) = h_0(t) \exp(s^\top w)" />. Two components: the <strong>baseline hazard</strong> <InlineMath math="h_0(t)" /> captures how risk changes over time (same for everyone—e.g., spikes at annual renewal), while the <strong>relative risk</strong> <InlineMath math="\exp(s^\top w)" /> scales it by customer features (different per customer). The state <InlineMath math="s" /> can come from Poisson factorisation. You get interpretable coefficients (<InlineMath math="w" />) and predicted survival curves per customer.
          </p>
          <p>
            For SaaS: fit on historical cohorts, predict time-to-churn for current customers, prioritize interventions by expected weeks remaining. Censored observations (customers still active) are handled naturally.
          </p>
          <p>
            For richer state representations, replace the linear <InlineMath math="s^\top w" /> with a neural network: <InlineMath math="h(t|o) = h_0(t)\exp(f_\theta(o))" />.<sup><a href="#ref-3" className="cite">3</a></sup> The network learns the mapping from raw observations <InlineMath math="o" /> to log-hazard directly, no manual feature engineering. Train end-to-end with the partial likelihood loss.
          </p>

          <SurvivalVisual />

          <h3 id="frailty-models">Frailty models</h3>
          <p>
            Customers don't just churn—they expand, contract, or stay flat. These aren't independent. A customer prone to churn is probably also prone to contraction; one likely to expand is unlikely to churn. <strong>Multivariate frailty models</strong> capture this with correlated random effects across event types.
          </p>
          <p>
            For each customer <InlineMath math="i" /> and event type <InlineMath math="k \in \{\text{expand}, \text{contract}, \text{churn}\}" />, the hazard is <InlineMath math="h_k(t|s_i, z_{ik}) = z_{ik} \cdot h_{0k}(t)\exp(s_i^\top w_k)" />. The frailties <InlineMath math="z_i = (z_{i,\text{expand}}, z_{i,\text{contract}}, z_{i,\text{churn}})" /> are drawn from a multivariate distribution—typically multivariate Gamma or log-normal—with a covariance structure you estimate.
          </p>
          <p>
            What you learn: which customers have correlated risks (high churn frailty implies high contraction frailty), and how much of the variation in each event type is explained by observed features vs. unobserved heterogeneity. This matters for CLV: a customer with high expansion frailty and low churn frailty is worth more than one with the same observed features but reversed frailties.
          </p>
          <p>
            Note: this models <em>incidence</em>—whether and when an event happens—not <em>amount</em>. If a customer expands, how much? That's a separate model (e.g., a regression on expansion size, conditional on expansion occurring). For CLV you need both: the probability of expansion and the expected magnitude.
          </p>

          <FrailtyVisual />

          <h3 id="explainable-boosting-machines">Explainable boosting machines</h3>
          <p>
            Sometimes you don't need a learned representation at all. <strong>Explainable boosting machines</strong> (EBMs) are generalized additive models with automatic interaction detection:
          </p>
          <p>
            Each feature gets its own shape function, learned via gradient boosting. The model automatically detects pairwise interactions worth including. You can inspect every component: "this is what usage_days does to churn probability, holding everything else fixed."
          </p>
          <p>
            EBMs match gradient-boosted trees on tabular benchmarks but remain fully interpretable. For SaaS, this matters: you can hand a plot to a CS leader and they'll understand it. No post-hoc explanation needed—the model <em>is</em> the explanation.
          </p>
          <p>
            The limitation: EBMs assume features are given, not learned. They're excellent for structured data (CRM fields, usage metrics, billing history) but won't help you encode raw event sequences.
          </p>

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Gopalan, P., Hofman, J. M., & Blei, D. M. (2015). Scalable recommendation with hierarchical Poisson factorization. <em>Proceedings of the Conference on Uncertainty in Artificial Intelligence (UAI)</em>.</li>
              <li id="ref-2"><sup>2</sup> Acharya, A., Ghosh, J., & Zhou, M. (2015). Nonparametric Bayesian factor analysis for dynamic count matrices. <em>Proceedings of the International Conference on Artificial Intelligence and Statistics (AISTATS)</em>.</li>
              <li id="ref-3"><sup>3</sup> Kvamme, H., Borgan, Ø., & Scheel, I. (2019). Time-to-event prediction with neural networks and Cox regression. <em>Journal of Machine Learning Research</em>, 20, 1–30.</li>
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

