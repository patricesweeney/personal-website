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
            <li><strong>Behavioral</strong> observations record what actually happened in the system:
              <ul>
                <li>Product instrumentation (events, sessions, usage persistence)</li>
                <li>Transactions (billing, payments, renewals, expansions)</li>
                <li>CRM and lifecycle exposures (touches, stages, campaigns)</li>
                <li>Support operations (tickets, SLA breaches, incident exposure)</li>
              </ul>
            </li>
            <li><strong>Attitudinal</strong> observations capture what customers report or imply:
              <ul>
                <li>Surveys</li>
                <li>Interviews</li>
                <li>Call transcripts</li>
                <li>Free-text feedback</li>
                <li>In-person notes</li>
              </ul>
            </li>
            <li><strong>Context</strong> observations describe what the customer is and what binds them:
              <ul>
                <li>Enrichment (firmographics and technographics)</li>
                <li>Contract and procurement terms</li>
                <li>Compliance requirements</li>
                <li>Org structure</li>
                <li>External market and competitor desk research</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

