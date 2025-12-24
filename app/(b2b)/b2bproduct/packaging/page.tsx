import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Packaging | Product",
  description: "Optimize feature bundling and plan structure",
};

const config = {
  type: "poisson_factorization" as const,
  title: "Packaging",
  description: "Analyze feature usage patterns to optimize how features are bundled into plans. Identify natural feature clusters and understand which combinations drive upgrades.",
  marketing: {
    headline: "Your pricing tiers were designed in a conference room. Your customers had other ideas.",
    problem: "Your packaging was set by product intuition and never revisited. Now you have features in the wrong tiers—power features languishing in enterprise while SMBs need them to activate, or commodity features gating upgrades that should be driving retention instead.",
    solution: "We analyze actual feature usage patterns across your customer base to identify natural feature clusters and upgrade drivers. You get data-driven recommendations for which features should gate which tiers, and which ones are better off ungated.",
    targetProfile: "B2B SaaS with 3+ pricing tiers and feature gating. You have 500+ customers and can track feature-level usage. Typically have a product-led or hybrid motion with visible upgrade paths.",
    trigger: "Your upgrade rate is declining, customers are asking for features on lower tiers, or you're planning a pricing/packaging overhaul and want data to inform it.",
    objections: [
      "\"We already know which features are premium.\" → Premium should mean 'drives upgrades,' not 'feels expensive.' Let's see if your intuition matches behavior.",
      "\"We can't change packaging easily.\" → Start with new customers. Grandfather existing ones. This analysis informs the next iteration.",
      "\"Our features are too integrated to gate.\" → Usage still clusters. We find which combinations create value together."
    ],
    testimonial: {
      quote: "We moved 'advanced reporting' from Pro to Starter. Upgrade rate dropped 5%, but activation increased 40% and churn dropped 20%. Net positive on customer equity.",
      author: "VP Product",
      role: "Series B Analytics Platform"
    },
    riskReversal: "If our recommendations don't come with clear expected impact estimates and implementation guidance, we'll work with your team until they do—at no extra cost.",
    uniqueness: "We don't just tell you what features are used together—we model the impact of feature access on upgrade probability. Move features between tiers with predicted outcomes.",
    offerAndRtr: "Upload your feature usage and subscription data to get a packaging analysis within 72 hours. Includes feature clustering, upgrade driver identification, and tier optimization recommendations with expected impact."
  },
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "current_plan",
      type: "required" as const,
      description: "Current subscription tier",
      example: "free, pro, enterprise",
    },
    {
      name: "feature_a_usage",
      type: "optional" as const,
      description: "Usage count for feature A",
      example: "42",
    },
    {
      name: "feature_b_usage",
      type: "optional" as const,
      description: "Usage count for feature B",
      example: "18",
    },
    {
      name: "feature_c_usage",
      type: "optional" as const,
      description: "Usage count for feature C",
      example: "7",
    },
    {
      name: "upgraded",
      type: "optional" as const,
      description: "Whether customer upgraded in period",
      example: "1 or 0",
    },
    {
      name: "mrr",
      type: "optional" as const,
      description: "Monthly recurring revenue",
      example: "99",
    },
  ],
  mlSolution: "We apply Non-negative Matrix Factorization (NMF) to discover latent feature usage patterns, then analyze upgrade probability by cluster. Includes association rule mining to find feature combinations that predict upgrades, and uplift modeling to estimate the revenue impact of ungating specific features.",
};

export default function PackagingPage() {
  return <AnalysisPage config={config} />;
}
