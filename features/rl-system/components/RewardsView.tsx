"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { JacobianHeatmap } from "./JacobianHeatmap";
import { CustomerEquityVisual } from "./CustomerEquityVisual";
import { CLVTrajectoryVisual } from "./CLVTrajectoryVisual";
import { RevenueDecomposition } from "./RevenueDecomposition";

export function RewardsView() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Rewards</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A company wants to maximize how much cash it pulls in over time, discounted for risk and waiting. That number—expected discounted free cash flow—is what the stock market calls enterprise value.<sup><a href="#ref-1" className="cite">1</a></sup>
          </p>

          <h3>Customer equity</h3>
          <p>
            Early-stage SaaS rarely has positive cash flow, so we use a proxy: <strong>customer equity</strong>,<sup><a href="#ref-2" className="cite">2</a></sup> the present value of all revenue from current and future customers. Revenue becomes our reward signal <InlineMath math="r_t" />. The goal is to find the policy <InlineMath math="\pi" /> that maximizes it:
          </p>
          <BlockMath math="\pi^* \in \arg\max_{\pi}\ \mathrm{CE}(\pi), \qquad \gamma\in(0,1)" />
          <BlockMath math="\mathrm{CE}(\pi) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty}\gamma^{t} r_t \right]" />
          <p>
            The discount factor <InlineMath math="\gamma" /> captures impatience and risk—a dollar next year is worth less than a dollar today.
          </p>

          <CustomerEquityVisual />

          <h3>Customer lifetime value</h3>
          <p>
            Customer equity is the sum of individual <strong>customer lifetime values</strong> (CLVs)<sup><a href="#ref-3" className="cite">3</a></sup>—some customers you have now, some you'll acquire later:
          </p>
          <BlockMath math="\mathrm{CE}(\pi) = \sum_{i \in N} \mathrm{CLV}_i(\pi) + \sum_{i \in M} \mathrm{CLV}_i(\pi)" />

          <p>
            Each customer's CLV is what they pay upfront, plus what they keep paying over time (adjusted for churn and growth):
          </p>
          <BlockMath math="\mathrm{CLV}(\pi) = \mathrm{ARPA}_0(\pi) + \sum_{t=1}^{\infty} \gamma^t \left( \prod_{k=1}^{t} \mathrm{NRR}_k(\pi) \right) \mathrm{ARPA}_0(\pi)" />
          <p>
            <InlineMath math="\mathrm{ARPA}_0" /> is initial revenue per account. <InlineMath math="\mathrm{NRR}_k" /> is net revenue retention in period <InlineMath math="k" />—how much of last period's revenue survives and grows.
          </p>

          <CLVTrajectoryVisual />

          <p>
            We can break this down further. Initial revenue is price <InlineMath math="p_0" /> times volume <InlineMath math="v(p_0)" />, where volume depends on price through some response function.<sup><a href="#ref-4" className="cite">4</a></sup> Period-over-period change splits into retention <InlineMath math="r_k" />, expansion <InlineMath math="e_k" />, and contraction <InlineMath math="c_k" />:
          </p>
          <BlockMath math="\mathrm{CLV}(\pi) = \sum_{t=0}^{\infty} \gamma^t \, p_0(\pi) \, v(p_0(\pi)) \prod_{k=1}^{t} r_k(\pi) \, e_k(\pi) \, c_k(\pi)" />

          <p>
            This covers all the ways revenue can move: you acquire customers (volume), set a price, keep them (retention), grow them (expansion), or lose pieces of them (contraction). Any policy that raises customer equity works through one of these levers.
          </p>

          <RevenueDecomposition />

          <h3>Near-decomposability of CLV</h3>
          <p>
            A useful property: this system is <strong>nearly decomposable</strong>.<sup><a href="#ref-5" className="cite">5</a></sup> Take logs:
          </p>
          <BlockMath math="\log \mathrm{CLV}(\pi) = \log p(\pi) + \log v(\pi) + \sum_k \left( \log r_k(\pi) + \log e_k(\pi) + \log c_k(\pi) \right)" />
          <p>
            Linearize locally. The Jacobian entries are elasticities:<sup><a href="#ref-6" className="cite">6</a></sup> <InlineMath math="\partial \log \mathrm{CLV} / \partial \log x" /> for each component <InlineMath math="x" />. The off-diagonal entries—cross-elasticities like <InlineMath math="\partial \log r / \partial \log p" />—measure coupling between subsystems.
          </p>
          <p>
            Near-decomposability means these cross-elasticities are small. Price and volume are tightly coupled (large <InlineMath math="|\partial \log v / \partial \log p|" />). But retention, expansion, and contraction depend mostly on post-sale experience—the cross-terms with price are weak. You can optimize subsystems semi-independently: pricing doesn't require a full retention model, retention interventions don't re-solve pricing. The coupling exists, but local optimization gets you most of the way.
          </p>

          <JacobianHeatmap />

          <h3>Value functions</h3>
          <p>
            Customer equity is the goal, but you act one period at a time. To decide what to do, you need to know what future CE looks like from where you stand.
          </p>

          <p>
            The <strong>state-value function</strong> <InlineMath math="V^\pi(s)" /> answers: "starting from state <InlineMath math="s" />, what's my expected future CE if I follow policy <InlineMath math="\pi" />?"
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \mathrm{CE}(\pi) \;\middle|\; s_0 = s \right]" />

          <p>
            The <strong>state-action value function</strong> <InlineMath math="Q^\pi(s,a)" /> answers: "what if I take action <InlineMath math="a" /> first, then follow <InlineMath math="\pi" />?"
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \mathrm{CE}(\pi) \;\middle|\; s_0 = s, \, a_0 = a \right]" />

          <p>
            The <strong>advantage function</strong> <InlineMath math="A^\pi(s,a)" /> answers: "how much better is action <InlineMath math="a" /> than whatever I'd normally do?"
          </p>
          <BlockMath math="A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)" />
          <p>
            Positive advantage means the action beats the baseline. Negative means you're better off sticking with the default.
          </p>

          <hr className="references-divider" />

          <div className="references">
            <p className="meta">References</p>
            <ol>
              <li id="ref-1"><sup>1</sup> Koller, T., Goedhart, M., & Wessels, D. (2025). <em>Valuation: Measuring and managing the value of companies</em>. John Wiley & Sons.</li>
              <li id="ref-2"><sup>2</sup> Rust, R. T., Lemon, K. N., & Zeithaml, V. A. (2004). Return on marketing: Using customer equity to focus marketing strategy. <em>Journal of Marketing</em>, 68(1), 109–127.</li>
              <li id="ref-3"><sup>3</sup> Ascarza, E., Fader, P. S., & Hardie, B. G. (2017). Marketing models for the customer-centric firm. In <em>Handbook of marketing decision models</em> (pp. 297–329). Springer International Publishing.</li>
              <li id="ref-4"><sup>4</sup> Phillips, R. L. (2021). <em>Pricing and revenue optimization</em>. Stanford University Press.</li>
              <li id="ref-5"><sup>5</sup> Simon, H. A., & Ando, A. (1961). Aggregation of variables in dynamic systems. <em>Econometrica</em>, 29(2), 111–138.</li>
              <li id="ref-6"><sup>6</sup> Mas-Colell, A., Whinston, M. D., & Green, J. R. (1995). <em>Microeconomic Theory</em>. Oxford University Press.</li>
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
