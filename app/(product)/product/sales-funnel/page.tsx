import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Sales Funnel Analysis | Product",
  description: "Analyze conversion rates and identify bottlenecks across your sales funnel",
};

const config = {
  type: "survival_analysis" as const,
  title: "Sales Funnel Analysis",
  description: "Analyze conversion rates and time-in-stage across your sales funnel. Identify bottlenecks, predict deal velocity, and optimize stage transitions.",
  marketing: {
    headline: "Your funnel has a leak. We'll show you exactly where.",
    problem: "You know your overall conversion rate, but you don't know where deals die. Is it the demo-to-proposal transition? Are enterprise deals stalling in security review? Without stage-level visibility, you're optimizing blind.",
    solution: "We analyze your pipeline data to show conversion rates and time-in-stage by segment, rep, deal size, and source. You get a heatmap of where deals stall, plus predictive indicators for deals at risk of going dark.",
    targetProfile: "B2B SaaS with a defined sales process (3+ stages) and 6+ months of pipeline data. You have a sales leader or RevOps function looking to improve forecast accuracy and deal velocity.",
    trigger: "Your forecast was off by 30% last quarter and you don't know why. Or your average sales cycle just got 2 weeks longer and leadership is asking questions.",
    objections: [
      "\"We track this in Salesforce.\" → Dashboards show you what happened. We show you why and what to do about it.",
      "\"Every deal is different.\" → True, but patterns exist. Enterprise deals stall at different points than mid-market. We find those patterns.",
      "\"Our data is messy.\" → Sales data is always messy. We clean it, normalize stages, and work with what you have."
    ],
    testimonial: {
      quote: "We found that 40% of our deals were dying in 'proposal sent' because reps weren't following up. A simple SLA dropped that to 15%.",
      author: "VP Revenue Operations",
      role: "Series C HR Tech"
    },
    riskReversal: "If we can't identify at least 3 actionable insights from your funnel data, we'll refund the analysis fee and share what we learned anyway.",
    uniqueness: "We don't just show you conversion rates—we model time-to-convert and identify deals that are taking too long given their characteristics. Catch stalled deals before they go dark.",
    offerAndRtr: "Upload your opportunity data to get a comprehensive funnel analysis within 48 hours. Includes stage-by-stage conversion rates, time-in-stage benchmarks, segment breakdowns, and stalled deal alerts."
  },
  columns: [
    {
      name: "deal_id",
      type: "required" as const,
      description: "Unique identifier for each deal/opportunity",
      example: "deal_456",
    },
    {
      name: "stage",
      type: "required" as const,
      description: "Current or final pipeline stage",
      example: "discovery, demo, proposal, negotiation",
    },
    {
      name: "days_in_stage",
      type: "required" as const,
      description: "Days spent in current stage",
      example: "7",
    },
    {
      name: "converted",
      type: "required" as const,
      description: "Whether deal moved to next stage or closed won",
      example: "1 or 0",
    },
    {
      name: "deal_size",
      type: "optional" as const,
      description: "Expected deal value",
      example: "50000",
    },
    {
      name: "source",
      type: "optional" as const,
      description: "Lead source or channel",
      example: "inbound, outbound, referral",
    },
    {
      name: "rep_id",
      type: "optional" as const,
      description: "Sales rep identifier",
      example: "rep_123",
    },
    {
      name: "segment",
      type: "optional" as const,
      description: "Customer segment",
      example: "smb, mid-market, enterprise",
    },
  ],
};

export default function SalesFunnelPage() {
  return <AnalysisPage config={config} />;
}
