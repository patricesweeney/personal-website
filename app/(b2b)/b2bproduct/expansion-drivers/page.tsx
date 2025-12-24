import { Metadata } from "next";
import { AnalysisPage } from "@/features/demos/components/AnalysisPage";

export const metadata: Metadata = {
  title: "Expansion Drivers | Product",
  description: "Identify what drives customers to expand their usage and spend",
};

const config = {
  type: "nrr_decomposition" as const,
  title: "Expansion Drivers",
  description: "Identify the key factors that drive customers to expand their usage, add seats, or upgrade plans. Understand which behaviors predict upsell opportunities.",
  marketing: {
    headline: "Your best upsell opportunities are hiding in your usage data.",
    problem: "CS is supposed to drive expansion, but they're playing whack-a-mole—reaching out when contracts are up, not when customers are ready. Meanwhile, high-expansion-potential accounts go untouched while your team chases accounts that will never grow.",
    solution: "We analyze your customer data to identify which behaviors and characteristics predict expansion. You get a scored list of expansion-ready accounts plus the playbooks that work for each expansion type (seats, usage, upsell).",
    targetProfile: "B2B SaaS with meaningful expansion revenue (>20% of new ARR). You have a CS or AM team responsible for growth and want to point them at the right accounts.",
    trigger: "Your NRR is declining, your expansion pipeline is thin, or you just hired CSMs and need to deploy them efficiently against the best opportunities.",
    objections: [
      "\"We know which accounts will expand.\" → You know which ones did. Can you predict which ones will? We build the model so you see opportunities early.",
      "\"Expansion is relationship-driven.\" → Relationships matter for closing. But expansion-ready accounts have observable patterns. We find them.",
      "\"Our product is flat-rate.\" → Seats, usage, add-ons—most products have expansion levers. We identify which ones are underutilized."
    ],
    testimonial: {
      quote: "We identified that customers who connect 3+ integrations have 4x the expansion rate. We built an integration adoption program and grew expansion revenue 50% in two quarters.",
      author: "VP Customer Success",
      role: "Series C Integration Platform"
    },
    riskReversal: "If the model doesn't identify expansion-ready accounts with at least 2x the baseline expansion rate, we'll refine it until it does or refund the analysis.",
    uniqueness: "We don't just score accounts—we tell you what type of expansion they're ready for and what triggered their readiness. Your CS team gets a playbook, not just a list.",
    offerAndRtr: "Upload your customer and usage data to get an expansion analysis within 48 hours. Includes account scores, expansion type predictions, and behavioral triggers for each opportunity."
  },
  columns: [
    {
      name: "customer_id",
      type: "required" as const,
      description: "Unique identifier for each customer",
      example: "cust_123",
    },
    {
      name: "expanded",
      type: "required" as const,
      description: "Whether customer expanded in period",
      example: "1 or 0",
    },
    {
      name: "expansion_amount",
      type: "optional" as const,
      description: "Dollar amount of expansion",
      example: "5000",
    },
    {
      name: "seats_added",
      type: "optional" as const,
      description: "Number of seats added",
      example: "5",
    },
    {
      name: "feature_adoption",
      type: "optional" as const,
      description: "Percentage of features used",
      example: "0.75",
    },
    {
      name: "usage_growth",
      type: "optional" as const,
      description: "Month-over-month usage growth",
      example: "0.25",
    },
    {
      name: "tenure_months",
      type: "optional" as const,
      description: "Months since customer acquisition",
      example: "12",
    },
    {
      name: "csm_touches",
      type: "optional" as const,
      description: "Number of CSM interactions",
      example: "4",
    },
  ],
};

export default function ExpansionDriversPage() {
  return <AnalysisPage config={config} />;
}
