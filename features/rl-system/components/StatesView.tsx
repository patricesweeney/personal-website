"use client";

import { ObservationsMindMap } from "./ObservationsMindMap";

export function StatesView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>States</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <h3>Observations</h3>
          <p>
            A SaaS company's observation modalities fall into three classes:
          </p>
          <ObservationsMindMap />
        </div>
      </div>
    </section>
  );
}

