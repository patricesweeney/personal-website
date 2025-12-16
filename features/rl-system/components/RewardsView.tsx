"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

export function RewardsView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Rewards</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A profit-seeking firm's objective is to maximize <strong>expected discounted free cash flow</strong> (enterprise value).<sup><a href="#ref-1" className="cite">1</a></sup> This decomposes into maximizing <strong>returns on invested capital</strong> and scaling the invested-capital base.<sup><a href="#ref-2" className="cite">2</a></sup> In practice, the latter is often approximated by revenue growth.<sup><a href="#ref-3" className="cite">3</a></sup>
          </p>

          <p>
            For early-stage SaaS, free cash flow is often negative, noisy, and lagging, so a workable proxy is <strong>customer equity</strong>,<sup><a href="#ref-4" className="cite">4</a></sup> expected discounted revenue from the present and future customer base. Accordingly, take revenue as the reward signal <InlineMath math="r_t" />. Therefore, a SaaS startup's policy objective is:
          </p>
          <BlockMath math="\pi^* \in \arg\max_{\pi}\ \mathrm{CE}(\pi), \qquad \gamma\in(0,1)" />
          <p>
            where
          </p>
          <BlockMath math="\mathrm{CE}(\pi) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty}\gamma^{t} r_t \right]" />
          <p>
            Here <InlineMath math="\pi" /> is the company's <strong>policy</strong> and <InlineMath math="\gamma" /> is its <strong>discount factor</strong> (hurdle rate/WACC, or equivalently an effective risk preference).
          </p>

          <p>
            Customer equity can in turn be expressed as the sum of <strong>customer lifetime values</strong> (CLVs)<sup><a href="#ref-5" className="cite">5</a></sup> across present customers <InlineMath math="i \in N" /> and future customers <InlineMath math="i \in M" />:
          </p>
          <BlockMath math="\mathrm{CE}(\pi) = \sum_{i \in N} \mathrm{CLV}_i(\pi) + \sum_{i \in M} \mathrm{CLV}_i(\pi)" />

          <p>
            where, for a given customer, CLV under policy <InlineMath math="\pi" /> is:
          </p>
          <BlockMath math="\mathrm{CLV}(\pi) = \mathrm{ARPA}_0(\pi) + \sum_{t=1}^{\infty} \gamma^t \left( \prod_{k=1}^{t} \mathrm{NRR}_k(\pi) \right) \mathrm{ARPA}_0(\pi)" />
          <p>
            Here <InlineMath math="\mathrm{ARPA}_0(\pi)" /> is <strong>initial revenue</strong> and <InlineMath math="\mathrm{NRR}_k(\pi)" /> is <strong>net revenue retention</strong> in period <InlineMath math="k" />. Each future period's contribution is initial revenue scaled by discounting and the cumulative product of retention.
          </p>

          <p>
            <InlineMath math="\mathrm{ARPA}_0" /> itself decomposes into <strong>initial price</strong> <InlineMath math="p_0" /> and <strong>volume</strong> <InlineMath math="v(p_0)" />, where <InlineMath math="v(\cdot)" /> is a <strong>price response function</strong>.<sup><a href="#ref-6" className="cite">6</a></sup> <InlineMath math="\mathrm{NRR}" /> decomposes into a <strong>per-period retention factor</strong> <InlineMath math="s_k" />, and factors for <strong>expansion</strong> <InlineMath math="e_k" /> and <strong>contraction</strong> <InlineMath math="c_k" />:
          </p>
          <BlockMath math="\mathrm{CLV}(\pi) = \sum_{t=0}^{\infty} \gamma^t \, p_0(\pi) \, v(p_0(\pi)) \left( \prod_{k=1}^{t} s_k(\pi) \right) \left( \prod_{k=1}^{t} e_k(\pi) \right) \left( \prod_{k=1}^{t} c_k(\pi) \right)" />

          <p>
            The <strong>state-value function</strong> <InlineMath math="V^\pi(s)" /> is the expected discounted future revenue starting from state <InlineMath math="s" /> and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t \, p_0(\pi) \, v(p_0(\pi)) \prod_{k=1}^{t} s_k(\pi) \, e_k(\pi) \, c_k(\pi) \;\middle|\; s_0 = s \right]" />

          <p>
            The <strong>state-action value function</strong> <InlineMath math="Q^\pi(s,a)" /> is the expected discounted future revenue starting from state <InlineMath math="s" />, taking action <InlineMath math="a" /> immediately, and then following <InlineMath math="\pi" />:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t \, p_0(\pi) \, v(p_0(\pi)) \prod_{k=1}^{t} s_k(\pi) \, e_k(\pi) \, c_k(\pi) \;\middle|\; s_0 = s, \, a_0 = a \right]" />

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Shaikh, A. (2016). <em>Capitalism: Competition, conflict, crises</em>. Oxford University Press.</li>
              <li id="ref-2"><sup>2</sup> Costantini, P. (2011). <em>Cash return on capital invested: Ten years of investment analysis with the CROCI economic profit model</em>. Elsevier.</li>
              <li id="ref-3"><sup>3</sup> Koller, T., Goedhart, M., & Wessels, D. (2025). <em>Valuation: Measuring and managing the value of companies</em>. John Wiley & Sons.</li>
              <li id="ref-4"><sup>4</sup> Rust, R. T., Lemon, K. N., & Zeithaml, V. A. (2004). Return on marketing: Using customer equity to focus marketing strategy. <em>Journal of Marketing</em>, 68(1), 109–127.</li>
              <li id="ref-5"><sup>5</sup> Ascarza, E., Fader, P. S., & Hardie, B. G. (2017). Marketing models for the customer-centric firm. In <em>Handbook of marketing decision models</em> (pp. 297–329). Springer International Publishing.</li>
              <li id="ref-6"><sup>6</sup> Phillips, R. L. (2021). <em>Pricing and revenue optimization</em>. Stanford University Press.</li>
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
