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
            Let an MDP have states <InlineMath math="s" />, actions <InlineMath math="a" />, discount <InlineMath math="\gamma \in [0,1)" />, reward <InlineMath math="r_t" />, transition kernel <InlineMath math="P(s'|s,a)" />, and a policy <InlineMath math="\pi(a|s)" /> that maps each state to a distribution over actions.
          </p>

          <p>
            <InlineMath math="J(\pi)" /> is the <strong>policy objective</strong>: the expected discounted return when you follow <InlineMath math="\pi" /> from an initial-state distribution <InlineMath math="\rho_0" />. Formally,
          </p>
          <BlockMath math="J(\pi) = \mathbb{E}_{s_0 \sim \rho_0, \, a_t \sim \pi(\cdot|s_t), \, s_{t+1} \sim P(\cdot|s_t,a_t)} \left[ \sum_{t=0}^{\infty} \gamma^t r_t \right]" />
          <p>
            Equivalently, <InlineMath math="J(\pi) = \mathbb{E}_{s_0 \sim \rho_0}[ V^\pi(s_0) ]" />.
          </p>

          <p>
            <InlineMath math="V^\pi(s)" /> is the <strong>state-value function</strong>: the expected discounted return starting in state <InlineMath math="s" /> and then following <InlineMath math="\pi" /> thereafter. Formally,
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_t \sim \pi \right]" />
          <p>
            It satisfies the Bellman expectation equation:
          </p>
          <BlockMath math="V^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot|s), \, s' \sim P(\cdot|s,a)} \left[ r(s,a,s') + \gamma V^\pi(s') \right]" />

          <p>
            <InlineMath math="Q^\pi(s,a)" /> is the <strong>action-value function</strong>: the expected discounted return if you take action <InlineMath math="a" /> in state <InlineMath math="s" /> at time 0, then follow <InlineMath math="\pi" /> from the next state onward. Formally,
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}\left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s, \, a_0 = a, \, a_{t \geq 1} \sim \pi \right]" />
          <p>
            It satisfies:
          </p>
          <BlockMath math="Q^\pi(s,a) = \mathbb{E}_{s' \sim P(\cdot|s,a)} \left[ r(s,a,s') + \gamma \mathbb{E}_{a' \sim \pi(\cdot|s')} \left[ Q^\pi(s',a') \right] \right]" />
          <p>
            The linkage is <InlineMath math="V^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot|s)}[ Q^\pi(s,a) ]" />.
          </p>
        </div>
      </div>
    </section>
  );
}
