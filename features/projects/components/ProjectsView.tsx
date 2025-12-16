"use client";

export function ProjectsView() {
  return (
    <section className="section">
      <h2 className="section-title">Projects</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p className="meta">Bayesian Truth Serum</p>
          <p className="muted">
            <a href="https://bayesiantruthserum.org" target="_blank" rel="noopener noreferrer">bayesiantruthserum.org</a>
          </p>
          <p>
            Bayesian Truth Serum is a method for eliciting honest answers to subjective questions by rewarding responses that are both uncommon and surprisingly well-predicted by others. It leverages Bayesian inference to identify answers that reflect genuine private beliefs rather than conformity or guessing.
          </p>
          <p>
            Based on Dražen Prelec's paper
            {" "}
            <a href="https://www.science.org/doi/10.1126/science.1095722" target="_blank" rel="noopener noreferrer">A Bayesian Truth Serum for Subjective Data</a>.
            {" "}Implemented as an open source project.
          </p>
        </div>
        <div className="span-12">
          <p className="meta">shapmi</p>
          <p className="muted">
            <a href="https://github.com/patricesweeney/shapmi" target="_blank" rel="noopener noreferrer">github.com/patricesweeney/shapmi</a>
          </p>
          <p>
            Repository scaffold — details coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}

