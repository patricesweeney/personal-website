"use client";

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
          <ul>
            <li><strong>Behavioral and operational observations</strong> record what actually happened in the system: product instrumentation (events, sessions, usage persistence), transactions (billing, payments, renewals, expansions), CRM and lifecycle exposures (touches, stages, campaigns), and support operations (tickets, SLA breaches, incident exposure).</li>
            <li><strong>Attitudinal and intent observations</strong> capture what customers report or imply: surveys, interviews, call transcripts, free-text feedback, and in-person notes.</li>
            <li><strong>Context and constraint observations</strong> describe what the customer is and what binds them: enrichment (firmographics and technographics), contract and procurement terms, compliance requirements, org structure, plus external market and competitor desk research.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

