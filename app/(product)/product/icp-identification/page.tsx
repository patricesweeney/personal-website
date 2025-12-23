import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "ICP Identification | Product",
  description: "Identify your ideal customer profile from historical data",
};

const config = {
  type: "poisson_factorization" as const,
  title: "ICP Identification",
  description: "Identify your Ideal Customer Profile by analyzing which customer attributes correlate with high LTV, low churn, and fast sales cycles.",
  marketing: {
    headline: "Stop guessing who your best customers are. Let your data tell you.",
    problem: `Here's the nightmare you're living: You want MORE customers. Of course you do. Growth is oxygen. But every time you widen the aperture—target a new segment, loosen the qualification criteria, tell marketing to "cast a wider net"—something breaks downstream.

Conversion rates drop. Sales cycles stretch. Win rates crater. And the customers you DO close? They churn at 2x the rate, bleed your support team dry, and leave one-star reviews on their way out.

So you tighten up. Get "more focused." But now you're terrified you've gone too far. That perfect-fit customer you just passed on? They might have been worth $500K in lifetime value. You'll never know, because they're signing with your competitor right now.

This is the impossible math of customer acquisition: Every narrowing of your ICP increases conversion but decreases volume. Every broadening increases volume but tanks unit economics. And you're making these tradeoffs BLIND—with gut feel, HiPPO decisions, and "let's just try it and see."

Meanwhile, the tradeoffs CASCADE. That slightly-wrong ICP decision in January? It's why your March pipeline is full of tire-kickers. It's why your May cohort has 40% churn. It's why your July board meeting is a bloodbath.

Because here's what nobody tells you: ICP isn't a marketing exercise. It's the single highest-leverage decision in your entire company. Get it wrong by 10% and you're not just 10% off—you're compounding that error through every stage of the funnel, every month of the customer lifecycle, every dollar of LTV you'll never see.

You're not just leaving money on the table. You're lighting it on fire and wondering why the room is getting hot.`,
    solution: `We end the guessing. 

We take your historical customer data—every deal you've won, lost, churned, and expanded—and we reverse-engineer the truth. Not what you THINK makes a good customer. What actually DOES.

We calculate the expected lifetime value of every customer profile in your database. Not just "they churned" or "they didn't." The full picture: acquisition cost, time-to-close, expansion revenue, support burden, renewal probability, and referral value. All of it, quantified.

Then we show you the Pareto frontier—the precise tradeoff curve between reach and fit. You'll see exactly where the inflection points are. Which segments you should pursue aggressively. Which ones are profitable enough to accept but not worth chasing. And which ones are actively destroying value every time you close them.

You get a decision framework, not a persona deck. Specific criteria you can plug into lead scoring, outbound targeting, and territory planning. With confidence intervals, so you know where the data is strong and where you need to collect more.

No more "let's discuss this in the next QBR." No more "I think enterprise is our sweet spot." No more expensive experiments that take two quarters to read out. Just math. Clear, defensible, actionable math.`,
    targetProfile: "B2B SaaS companies with 100+ customers and at least 12 months of customer data. Typically Series A+ with a dedicated RevOps or Growth function looking to move from intuition-based to data-driven targeting.",
    trigger: "The moment that breaks most founders: You just lost your biggest deal of the quarter—and in the post-mortem, you realize you were never even in consideration. They needed something you don't do. You were wasting cycles on a dead end while the real opportunities rotted in your pipeline. Or worse: you're looking at your cohort analysis and there's a segment with 45% churn. You've been acquiring customers who were doomed from day one. And you have 200 more of them in the pipeline right now.",
    objections: [
      "\"We already know our ICP.\" → You know who you WANT your customer to be. But can you prove they're actually your most profitable? Most companies find a 30% gap between their assumed ICP and their actual best customers. That gap is costing you real money.",
      "\"We don't have enough data.\" → You have more than you think. 100 customers with basic attributes—industry, size, use case, and outcomes—is enough to find signal that's been invisible to you. If you truly don't have enough, we'll tell you in the first call, not after you've paid.",
      "\"Our market is too niche.\" → Niche is a gift. Broad markets are noisy—a thousand confounding variables. Niche markets have clean signal. The ICP patterns are often so clear it's almost embarrassing that you didn't see them before."
    ],
    testimonial: {
      quote: "We thought we were an enterprise product. The data showed our best customers were actually 200-500 employee companies. We shifted focus and improved win rates by 40%.",
      author: "VP Sales",
      role: "Series B DevTools Company"
    },
    riskReversal: "If we can't identify statistically significant patterns in your data, you pay nothing. We'll tell you upfront if your dataset isn't sufficient for meaningful analysis.",
    uniqueness: "We don't just give you a customer persona deck. We give you quantified criteria you can plug directly into your lead scoring, territory planning, and outbound targeting.",
    offerAndRtr: "Upload your customer data today. Within 48 hours, you'll have the answer to the question that's been costing you sleep: Who should we actually be selling to? You'll get expected LTV by segment, attribute importance rankings, the exact tradeoff curve between reach and fit, and targeting criteria you can deploy immediately. No retainer. No six-month engagement. Just the analysis, the answer, and the math to defend it in your next board meeting."
  },
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "ltv",
      type: "required" as const,
      description: "Customer lifetime value or proxy metric",
      example: "15000",
    },
    {
      name: "industry",
      type: "optional" as const,
      description: "Customer industry or vertical",
      example: "fintech, healthcare, ecommerce",
    },
    {
      name: "company_size",
      type: "optional" as const,
      description: "Employee count or size segment",
      example: "50, 500, enterprise",
    },
    {
      name: "geography",
      type: "optional" as const,
      description: "Region or country",
      example: "US, EMEA, APAC",
    },
    {
      name: "use_case",
      type: "optional" as const,
      description: "Primary use case or job-to-be-done",
      example: "analytics, automation, collaboration",
    },
    {
      name: "tech_stack",
      type: "optional" as const,
      description: "Key technologies in their stack",
      example: "salesforce, hubspot, snowflake",
    },
    {
      name: "sales_cycle_days",
      type: "optional" as const,
      description: "Days from first touch to close",
      example: "45",
    },
    {
      name: "churned",
      type: "optional" as const,
      description: "Whether customer churned",
      example: "1 or 0",
    },
  ],
};

export default function ICPIdentificationPage() {
  return <AnalysisPage config={config} />;
}
