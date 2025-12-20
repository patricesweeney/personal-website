"use client";

import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

const ObservationsMindMap = dynamic(
  () => import("./ObservationsMindMap").then((mod) => mod.ObservationsMindMap),
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
            For each customer <InlineMath math="i" /> at each time <InlineMath math="t" />, you observe a vector in <InlineMath math="\mathbb{R}^N" />—thousands of features from telemetry, CRM, billing, support. You need to compress it to <InlineMath math="\mathbb{R}^M" /> where <InlineMath math="M \ll N" />. That compression is the representation.
          </p>
          <p>
            Ideally, the <InlineMath math="M" /> dimensions correspond to factors humans recognize: engagement, sophistication, purchase intent, satisfaction. If the representation is opaque, you can't inspect it, override it, or explain decisions based on it.
          </p>
          <p>
            Time complicates this. Customer state isn't a snapshot—it's a trajectory. A customer who logged in yesterday after three months of silence is different from one who logs in daily. The representation must encode history, not just the current observation.
          </p>
          <p>
            Scale complicates it further. You have thousands of customers, each with their own trajectory. The representation must generalize: learn shared structure across customers while capturing individual differences. Pool too aggressively and you miss heterogeneity. Pool too little and you overfit to noise.
          </p>

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
        </div>
      </div>

    </section>
  );
}

