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
            For a matrix <InlineMath math="O" /> of customers × events, you learn <InlineMath math="O_{ij} \sim \text{Poisson}(s_i^\top w_j)" /> where <InlineMath math="s_i" /> is customer <InlineMath math="i" />'s latent state and <InlineMath math="w_j" /> is the weight vector for event type <InlineMath math="j" />. The <InlineMath math="s_i" /> vectors are your state representations.
          </p>
          <p>
            For adoption data—did the customer use feature <InlineMath math="j" /> or not—binarize the counts and use Bernoulli-Poisson factorisation:<sup><a href="#ref-2" className="cite">2</a></sup> <InlineMath math="O_{ij} \in \{0,1\}" /> with <InlineMath math="P(O_{ij} = 1) = 1 - e^{-s_i^\top w_j}" />. Same latent structure, but the likelihood matches the binary observation. Useful when frequency doesn't matter, only adoption.
          </p>

          <FactorLoadingsVisual />

          <h3 id="sequence-encoders">Sequence encoders</h3>
          <p>
            Customer behavior unfolds over time: logins, clicks, tickets, payments. A sequence encoder compresses this history into a fixed-length vector—a state you can condition decisions on.
          </p>
          <p>
            <strong>Transformers</strong> are the current default. They attend to the full history at once, learning which past events matter for the current decision. No Markov assumption—the model decides what to remember. For SaaS, this means encoding months of product usage into a single embedding that predicts churn, expansion, or next action.
          </p>
          <p>
            The alternative is <strong>recurrent models</strong> (LSTM, GRU): process events step by step, updating a hidden state. Cheaper at inference, but harder to train on long sequences. State-space models (Mamba, S4) split the difference—linear-time training with recurrent-style inference.
          </p>

          <h3 id="concept-bottlenecks">Concept bottlenecks</h3>
          <p>
            Black-box embeddings are powerful but opaque. A <strong>concept bottleneck</strong> forces the model to route predictions through human-interpretable intermediate variables—concepts you define.
          </p>
          <p>
            Instead of embedding → prediction, you get embedding → concepts → prediction. The concepts might be "power user," "at-risk," "expanding," "cost-sensitive." You label some examples, the model learns to predict concepts from raw data, and downstream decisions depend only on the concepts.
          </p>
          <p>
            The win: you can inspect and override. If the model says "at-risk" but you know better, you intervene at the concept level. The cost: you're bottlenecked by the concepts you thought to define. If the true signal isn't captured by your concept set, you lose it.
          </p>

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
            The limitation: EBMs assume features are given, not learned. They're excellent for structured data (CRM fields, usage metrics, billing history) but won't help you encode raw event sequences. Combine them with sequence encoders: transformer produces an embedding, EBM explains how embedding components drive decisions.
          </p>

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Gopalan, P., Hofman, J. M., & Blei, D. M. (2015). Scalable recommendation with hierarchical Poisson factorization. <em>Proceedings of the Conference on Uncertainty in Artificial Intelligence (UAI)</em>.</li>
              <li id="ref-2"><sup>2</sup> Acharya, A., Ghosh, J., & Zhou, M. (2015). Nonparametric Bayesian factor analysis for dynamic count matrices. <em>Proceedings of the International Conference on Artificial Intelligence and Statistics (AISTATS)</em>.</li>
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

