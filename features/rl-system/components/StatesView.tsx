"use client";

import dynamic from "next/dynamic";

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
            The job is to compress observations into states—lower-dimensional summaries that keep what matters and throw away what doesn't. This works because most data has structure: a customer isn't really 10,000 independent event features. Those features are correlated, driven by a few underlying factors like engagement, sophistication, and intent.
          </p>

          <h4>Static representations</h4>
          <p>
            Static methods take a snapshot and compress it. They assume the mapping from observations to states doesn't change over time.
          </p>
          <ul>
            <li>
              <strong>Linear methods</strong> (PCA, factor analysis): Find the directions of most variance. Fast and interpretable, but assume linear structure.
            </li>
            <li>
              <strong>Kernel methods</strong> (kernel PCA, spectral embedding): Handle curves by implicitly working in a richer space. Still a fixed mapping.
            </li>
            <li>
              <strong>Neighborhood methods</strong> (t-SNE, UMAP): Preserve local structure—nearby points stay nearby. Great for visualization, but you can't embed new points without re-running.
            </li>
            <li>
              <strong>Autoencoders</strong> (VAE, sparse AE): Learn to compress and reconstruct through a bottleneck. New observations embed directly. Can enforce sparsity or disentanglement.
            </li>
            <li>
              <strong>Contrastive methods</strong> (SimCLR, CLIP): Learn by pulling similar things together and pushing different things apart. No reconstruction needed—only similarity.
            </li>
          </ul>

          <h4>Dynamic representations</h4>
          <p>
            Static methods ignore time. But for decisions, history often matters: a customer who logged in yesterday after six months of silence is different from one who logs in daily. Dynamic methods learn representations that evolve.
          </p>
          <ul>
            <li>
              <strong>Recurrent models</strong> (LSTM, GRU): Process sequences step by step, updating a hidden state. The state summarizes everything seen so far.
            </li>
            <li>
              <strong>State-space models</strong> (Kalman filters, HMMs): Assume a latent state evolves according to known dynamics, and observations are noisy glimpses of it. Good when you have a model of how things change.
            </li>
            <li>
              <strong>Transformers</strong>: Attend to the full history at once, weighting what's relevant. No fixed summary—recompute attention for each decision.
            </li>
            <li>
              <strong>World models</strong>: Learn to predict what happens next, and use the predictor's internal state as the representation. The state is whatever's useful for forecasting.
            </li>
          </ul>
          <p>
            For SaaS: static methods work for health scores and segmentation; dynamic methods matter when you care about trajectories—churn prediction, lifecycle stage, next-best-action.
          </p>
          <p>
            The test of a good state isn't whether you can reconstruct the original data. It's whether two observations that map to the same state should get the same action. If they shouldn't, you're missing something.
          </p>
        </div>
      </div>

      <style jsx>{`
        h4 {
          font-size: 15px;
          font-weight: 600;
          margin-top: var(--space-6);
          margin-bottom: var(--space-3);
          color: var(--fg);
        }
      `}</style>
    </section>
  );
}

