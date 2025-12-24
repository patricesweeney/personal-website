import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Channel Attribution | Product",
  description: "Measure channel effectiveness and optimize marketing spend",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "Channel Attribution",
  description: "Decompose revenue attribution across marketing channels using Bayesian media mix modeling. Understand ROI by channel and optimize budget allocation.",
  marketing: {
    headline: "Know exactly which channels drive revenue—not just clicks.",
    problem: "Marketing attribution is broken. Last-touch gives all credit to the final interaction. Multi-touch models are black boxes. Meanwhile, you're flying blind on a 7-figure marketing budget, unable to answer the simple question: if I put another dollar into paid search vs. content, which one drives more revenue?",
    solution: "We use Bayesian media mix modeling to estimate the true incremental impact of each channel, accounting for time lags, saturation effects, and cross-channel interactions. You get actionable ROI estimates you can use to reallocate budget with confidence.",
    targetProfile: "B2B SaaS companies spending $50K+/month on marketing across 3+ channels. You have a demand gen team that's under pressure to prove ROI and optimize spend allocation.",
    trigger: "Your CFO is asking for marketing ROI by channel and you can't give a confident answer. Or you're planning next year's budget and need data to justify your allocation.",
    objections: [
      "\"We use Google Analytics attribution.\" → GA tells you who touched what, not what drove incremental conversions. We measure true lift.",
      "\"Our sales cycles are too long.\" → Long cycles are exactly where traditional attribution fails. Our time-lag models handle 6+ month cycles.",
      "\"We don't have clean data.\" → We work with messy real-world data. Perfect tracking is a myth—we account for gaps."
    ],
    testimonial: {
      quote: "We discovered our 'best performing' channel was actually just capturing demand we would have gotten anyway. Shifted budget to truly incremental channels and improved CAC by 25%.",
      author: "Head of Demand Gen",
      role: "Series C Fintech"
    },
    riskReversal: "We provide confidence intervals on all estimates. If the uncertainty is too high to make decisions, we'll tell you and refund your investment.",
    uniqueness: "We don't just measure what happened—we model what would happen if you changed your mix. Run budget scenarios before committing real dollars.",
    offerAndRtr: "Upload your marketing spend and revenue data to get channel-level ROI estimates, optimal budget allocation recommendations, and scenario modeling capabilities. Results in 72 hours."
  },
  columns: [
    {
      name: "date",
      type: "required" as const,
      description: "Date of the observation (daily or weekly)",
      example: "2024-01-15",
    },
    {
      name: "revenue",
      type: "required" as const,
      description: "Revenue or conversions for the period",
      example: "50000",
    },
    {
      name: "paid_search_spend",
      type: "optional" as const,
      description: "Paid search advertising spend",
      example: "5000",
    },
    {
      name: "paid_social_spend",
      type: "optional" as const,
      description: "Paid social advertising spend",
      example: "3000",
    },
    {
      name: "display_spend",
      type: "optional" as const,
      description: "Display/programmatic advertising spend",
      example: "2000",
    },
    {
      name: "tv_spend",
      type: "optional" as const,
      description: "TV/video advertising spend",
      example: "10000",
    },
    {
      name: "email_sends",
      type: "optional" as const,
      description: "Number of marketing emails sent",
      example: "50000",
    },
    {
      name: "organic_traffic",
      type: "optional" as const,
      description: "Organic website sessions",
      example: "25000",
    },
  ],
  mlSolution: "We implement Bayesian Media Mix Modeling (MMM) using PyMC. The model estimates channel-level ROI with adstock transformations for carryover effects and saturation curves for diminishing returns. Includes posterior distributions for confidence intervals, scenario simulation for budget optimization, and incremental lift estimation vs. baseline.",
};

export default function ChannelAttributionPage() {
  return <AnalysisPage config={config} />;
}
