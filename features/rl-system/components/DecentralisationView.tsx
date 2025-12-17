"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

export function DecentralisationView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Decentralisation</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A company has <InlineMath math="n" /> teams, each with their own policy <InlineMath math="\pi_i" />.<sup><a href="#ref-1" className="cite">1</a></sup> The company's policy is the joint profile <InlineMath math="\pi = (\pi_1, \ldots, \pi_n)" />. For any team <InlineMath math="i" />, we write <InlineMath math="\pi_{-i}" /> for everyone else's policies.
          </p>
          <p>
            In theory, all teams share the same goal: maximize expected customer equity <InlineMath math="\mathrm{CE}(\pi)" />. Each team <InlineMath math="i" /> should pick actions <InlineMath math="a_i" /> that maximize <InlineMath math="Q^\pi(s, a_i, a_{-i})" /> given the joint action profile. The company wins together or loses together.
          </p>

          <h3>The credit assignment problem</h3>
          <p>
            In practice, learning from shared rewards is hard.<sup><a href="#ref-5" className="cite">5</a></sup> When team <InlineMath math="i" /> takes action <InlineMath math="a_i" />, the outcome depends on what everyone else did too—plus luck:
          </p>
          <BlockMath math="r = r(s, a_i, a_{-i}, \varepsilon)" />
          <p>
            The variance of <InlineMath math="r" /> is driven by <InlineMath math="a_{-i}" /> (other teams exploring) and <InlineMath math="\varepsilon" /> (exogenous noise). Team <InlineMath math="i" />'s marginal contribution <InlineMath math="\partial r / \partial a_i" /> is small relative to <InlineMath math="\mathrm{Var}(r)" />. The learning signal has low signal-to-noise ratio.
          </p>
          <p>
            This is the <strong>credit assignment problem</strong>: when the company succeeds, who deserves credit? When it fails, who's at fault? With shared rewards and high variance, individual teams can't tell whether their actions helped or hurt. Learning stalls.
          </p>

          <h3>The gold standard: counterfactual baselines</h3>
          <p>
            The clean solution is to reward each team for their <em>marginal contribution</em>: the actual outcome minus a counterfactual where their action is replaced with some default.<sup><a href="#ref-5" className="cite">5</a>,<a href="#ref-6" className="cite">6</a></sup>
          </p>
          <BlockMath math="d_i = r(s, a) - r(s, a_{-i}, \bar{a}_i)" />
          <p>
            Here <InlineMath math="d_i" /> is team <InlineMath math="i" />'s <strong>difference reward</strong>: the company's reward with their action, minus what the company would have gotten if team <InlineMath math="i" /> had taken some baseline action <InlineMath math="\bar{a}_i" /> instead. This strips out the noise from other teams—their actions are held fixed in both terms.
          </p>
          <p>
            COMA<sup><a href="#ref-7" className="cite">7</a></sup> applies this in deep RL: use a centralized critic to estimate the counterfactual baseline, then train decentralized actors on the difference. Each team learns from a signal that isolates their contribution.
          </p>

          <h3>Why this is hard in practice</h3>
          <p>
            The economics literature calls this problem <strong>moral hazard in teams</strong>.<sup><a href="#ref-2" className="cite">2</a>,<a href="#ref-3" className="cite">3</a></sup> If you can't observe each team's contribution, you can't reward it. Teams face weak incentives and free-ride on others' effort. Tournaments<sup><a href="#ref-4" className="cite">4</a></sup> and relative performance evaluation help, but the core problem remains: shared outcomes make individual accountability hard.
          </p>

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Marschak, J., & Radner, R. (1972). <em>Economic Theory of Teams</em>. Yale University Press.</li>
              <li id="ref-2"><sup>2</sup> Holmström, B. (1979). Moral hazard and observability. <em>The Bell Journal of Economics</em>, 10(1), 74–91.</li>
              <li id="ref-3"><sup>3</sup> Holmström, B., & Milgrom, P. (1991). Multitask principal-agent analyses: Incentive contracts, asset ownership, and job design. <em>Journal of Law, Economics, & Organization</em>, 7, 24–52.</li>
              <li id="ref-4"><sup>4</sup> Lazear, E. P., & Rosen, S. (1981). Rank-order tournaments as optimum labor contracts. <em>Journal of Political Economy</em>, 89(5), 841–864.</li>
              <li id="ref-5"><sup>5</sup> Agogino, A. K., & Tumer, K. (2004). Unifying temporal and structural credit assignment problems. <em>Proceedings of the Third International Joint Conference on Autonomous Agents and Multiagent Systems</em>, 980–987.</li>
              <li id="ref-6"><sup>6</sup> Wolpert, D. H., & Tumer, K. (2002). Optimal payoff functions for members of collectives. <em>Advances in Complex Systems</em>, 5(2–3), 265–279.</li>
              <li id="ref-7"><sup>7</sup> Foerster, J., Farquhar, G., Afouras, T., Nardelli, N., & Whiteson, S. (2018). Counterfactual multi-agent policy gradients. <em>Proceedings of the AAAI Conference on Artificial Intelligence</em>, 32(1).</li>
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

