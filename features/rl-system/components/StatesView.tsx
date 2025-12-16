"use client";

import { ObservationsMindMap } from "./ObservationsMindMap";

export function StatesView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>States</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A defining problem in SaaS is the <strong>sheer volume of data</strong>—product telemetry, CRM records, billing events, support tickets, survey responses—most of which is irrelevant to good decision-making. The challenge isn't access to information; it's that signal is buried in noise.
          </p>
          <p>
            Critically, <strong>we don't get states for free</strong>. We get <em>observations</em>: raw, high-dimensional, often redundant streams of data. A <strong>state</strong> is a name that must be <em>earned</em>—it refers to a compressed representation that is sufficient for predicting future rewards and selecting actions. The goal of representation learning is to transform observations into states.
          </p>

          <h3>Observations</h3>
          <p>
            A SaaS company's observation modalities fall into three classes:
          </p>
          <ObservationsMindMap />

          <h3 style={{ marginTop: "var(--space-8)" }}>Representation learning</h3>
          <p>
            The transformation from observations to states is the domain of <strong>representation learning</strong>: finding low-dimensional structure in high-dimensional data that preserves the information relevant to a task.
          </p>
          <p>
            The key insight is that real-world observations typically lie on or near a <strong>manifold</strong>—a lower-dimensional surface embedded in the high-dimensional observation space. A customer isn't really described by 10,000 event features; those features are correlated and driven by a handful of latent factors (engagement level, sophistication, purchase intent).
          </p>
          <p>
            The main approaches to learning these representations:
          </p>
          <ul>
            <li>
              <strong>Linear methods</strong> (PCA, factor analysis): Find directions of maximum variance or latent factors. Fast and interpretable, but assume the manifold is flat.
            </li>
            <li>
              <strong>Kernel methods</strong> (kernel PCA, spectral embedding): Capture nonlinear structure by operating in an implicit feature space. The manifold can curve, but the mapping is fixed.
            </li>
            <li>
              <strong>Neighborhood methods</strong> (Isomap, LLE, t-SNE, UMAP): Preserve local distances or neighborhoods. Good for visualization and clustering, but the embedding isn't parameterized—new points require re-running.
            </li>
            <li>
              <strong>Autoencoders</strong> (VAE, sparse AE): Learn an encoder-decoder pair that compresses observations through a bottleneck. Parameterized, so new observations can be embedded directly. Can be regularized to encourage structure (sparsity, disentanglement).
            </li>
            <li>
              <strong>Contrastive methods</strong> (SimCLR, CLIP): Learn representations by pulling similar observations together and pushing dissimilar ones apart. Doesn't require reconstruction—only similarity judgments.
            </li>
          </ul>
          <p>
            For SaaS applications, the choice depends on the goal: linear methods for interpretable health scores, autoencoders for dense customer embeddings, contrastive methods when you have implicit similarity signals (e.g., customers who respond to the same campaigns).
          </p>
          <p>
            The test of a good representation isn't reconstruction fidelity—it's whether the state is <strong>sufficient for action selection</strong>. Two customers with identical states should warrant identical policies. If they don't, the representation is missing something decision-relevant.
          </p>
        </div>
      </div>
    </section>
  );
}

