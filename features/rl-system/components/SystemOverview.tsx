"use client";

import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

export function SystemOverview() {
  return (
    <section className="section" style={{ paddingTop: "var(--space-6)" }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Tl;dr</h2>
      <div className="grid grid-12">
        <div className="span-12">
          <p>
            A partially observable Markov decision process (POMDP) is a control loop where an agent repeatedly acts under uncertainty about the true world. The environment has a hidden state <InlineMath math="s_t" /> (the actual situation of the world at time <InlineMath math="t" />, not directly seen), the agent chooses an action <InlineMath math="a_t" /> (an intervention it can take), the environment returns a reward <InlineMath math="r_t" /> (a scalar feedback signal encoding how good that outcome was under the agent's objective), and the agent receives an observation <InlineMath math="o_t" /> (a noisy, partial measurement generated from the hidden state). Dynamics specify how actions change states <InlineMath math="P(s_{t+1} \mid s_t, a_t)" /> and how states generate observations <InlineMath math="P(o_t \mid s_t)" />, so the agent maintains a belief over states and selects actions to maximize expected cumulative reward.
          </p>
          <p>
            In a market framing, "the market" is just the external environment of customers, competitors, channels, budgets, and constraints, and you never touch it directly. You only ever make contact through observations (instrument readings like impressions, clicks, leads, demos, churn, qualitative feedback, competitor signals) and rewards (whatever you treat as success: profit, ARR, NRR, LTV, retention, or a shaped proxy). Everything else is inference: hidden states like "true demand," "trust," "willingness to pay," and "competitive pressure" are latent variables you hypothesize to explain your observations and rewards; actions are your experiments; and control is choosing actions that improve expected reward given what you can actually measure.
          </p>
        </div>
      </div>
    </section>
  );
}
